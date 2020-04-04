import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import videojs from 'video.js';
import { SocketService } from '../core/services/socket.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { ActivatedRoute, Router } from '@angular/router';
import { Room } from '../core/models/room';
import { ApiService } from '../core/services/api.service';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/user';
import { UserDetailComponent } from './user-detail/user-detail.component';

@Component({
	selector: 'app-player',
	templateUrl: './player.page.html',
	styleUrls: ['./player.page.scss']
})
export class PlayerPage implements OnInit {
	@ViewChild('sourceEl', { static: true }) source;
	@ViewChild('playerEl', { static: true }) playerEl;
	public player: videojs.Player;
	public onlineUsers: string[] = [];
	public readyUsers: string[] = [];

	private downloadProgress: { progress: number, speed: number, peers: number } = { progress: 0, speed: 0, peers: 0 };
	private room: Room;
	private ready: boolean = false;
	private readonly roomName: string;

	constructor(private _toast: ToastController, private _socket: SocketService,
				private _orientation: ScreenOrientation, private _router: Router,
				private _route: ActivatedRoute, private _api: ApiService,
				public auth: AuthService, private _modal: ModalController) {
		this.roomName = this._route.snapshot.paramMap.get('name');
	}

	public get progress() {
		return this.downloadProgress.progress;
	}

	public get peers() {
		return this.downloadProgress.peers;
	}

	public get speed() {
		return Math.round(((this.downloadProgress.speed / 1000000) + Number.EPSILON) * 100) / 100;
	}

	async ionViewDidEnter() {
		await this.initializePlayer(this.roomName);
	}

	ngOnInit() {

	}

	async ionViewDidLeave() {
		this._socket.destroy();
	}

	public async deleteRoom() {
		if (this.room.Owner !== this.auth.userId)
			return;

		try {
			await this._api.delete(`rooms/${encodeURIComponent(this.room.Id)}`, null, { responseType: 'text' });
			await this._router.navigate(['/tabs/rooms']);
		} catch (e) {

		}

	}

	public async leaveRoom() {
		if (this.room.Owner === this.auth.userId)
			return;

		await this._api.delete(`rooms/${encodeURIComponent(this.room.Id)}/leave`);
		await this._router.navigate(['/tabs/rooms']);
	}

	async presentModal(email: string) {
		const modal = await this._modal.create({
			component: UserDetailComponent,
			componentProps: {
				room: this.room,
				email
			}
		});

		return await modal.present();
	}

	private async initializePlayer(room: string) {
		try {
			this.player = videojs(this.playerEl.nativeElement, {
				width: window.innerWidth,
				preload: 'all'
			});
			this.player.hide();
			this._socket.create();
			this.room = await this._api.get(`rooms/${encodeURIComponent(room)}`);
			this.player.show();
		} catch (e) {
			await this._router.navigate(['/tabs/rooms']);
			return;
		}

		this._orientation.onChange().subscribe(() => {
				setTimeout(x => this.player.dimension('width', window.innerWidth), 50);
			}
		);


		this.player.controls(true);

		this._socket.on('room:torrent:progress', (currentProgress: { progress: number, speed: number, peers: number }) => {
		    console.log(currentProgress);
			this.downloadProgress = currentProgress;
		});

		this._socket.on('ready', async () => {
			this.player.controls(true);
		});

		this._socket.on('room:torrent:done', () => {
			this.downloadProgress.progress = 1;
		});
		const dcMsg = await this._toast.create({ message: 'Server disconnected you! Please wait while we reconnect... ' });
		const cMsg = await this._toast.create({
			message: 'You\'re connected! Happy streaming!',
			duration: 2000
		});


		/* ROOM EVENTS */
		this._socket.on('room:updated', (newRoom: Room) => {
			this.room = newRoom;
		});

		this._socket.on('room:error', async (error: string) => {
			const eMsg = await this._toast.create({
				message: `The following error occurred while connecting: ${error}`,
				duration: 2000
			});
			await eMsg.present();
			await this._router.navigate(['/']);
		});

		this._socket.on('room:deleted', async () => {
			const dMsg = await this._toast.create({
				message: `The room you were in was deleted by the owner!`,
				duration: 3000,
				position: 'top',
				color: 'danger'
			});

			if (this.room.Owner !== this.auth.userId)
				await dMsg.present();
			await this._router.navigate(['/']);
		});

		/* END ROOM EVENTS */

		/* USER EVENTS */
		this._socket.on('room:user:leaved', async (user: User) => {
			const jMsg = await this._toast.create({
				message: `${user.email} left the room!`,
				duration: 3000,
				position: 'top',
				color: 'danger'
			});

			if (user._id !== this.auth.userId)
				await jMsg.present();
		});

		this._socket.on('room:user:joined', async (user: User) => {
			const jMsg = await this._toast.create({
				message: `${user.email} joined the room!`,
				duration: 3000,
				position: 'top',
				color: 'success'
			});

			if (user._id !== this.auth.userId)
				await jMsg.present();
		});

		this._socket.on('room:user:online', (onlineUsers: string[]) => {
		    console.log(onlineUsers);
			this.onlineUsers = onlineUsers;
		});

		this._socket.on('room:user:ready', (readyUsers: string[]) => {
			this.readyUsers = readyUsers;
		});

		this._socket.on('room:user:kicked', async (user: User) => {
			if (user._id === this.auth.userId) {
				const kMsg = await this._toast.create({
					message: `You were kicked from the room!`,
					duration: 3000,
					position: 'top',
					color: 'danger'
				});

				await kMsg.present();
				await this._router.navigate(['tabs/rooms']);
			} else {
				const kMsg = await this._toast.create({
					message: `${user.email} was kicked from the room!`,
					duration: 3000,
					position: 'top',
					color: 'danger'
				});

				await kMsg.present();
			}
		});

		/* END USER EVENTS */


		this._socket.on('disconnect', async () => {
			await dcMsg.present();
			this.player.controls(false);
			this.player.pause();
		});

		this._socket.on('connect', async () => {
			this.connectToRoom(room);
			this.emitReadyState();
			await cMsg.present();
			await dcMsg.dismiss();
		});

		// Connect to the room and emit existing states
		this.connectToRoom(room);
		this.emitReadyState();
	}

	private connectToRoom(room: string) {
		this._socket.emit('room:connect', {
			room,
			user: this.auth.getToken()
		});
	}

	private emitReadyState() {
		this._socket.emit('room:user:ready', this.ready);
	}

	updateReadyState($event) {
		this.ready = $event.detail.checked;
		this.emitReadyState();
	}
}
