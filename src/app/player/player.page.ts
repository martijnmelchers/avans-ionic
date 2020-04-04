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
import { environment } from '../../environments/environment';
import { TorrentAddComponent } from './torrent-add/torrent-add.component';

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
	public playerReady = false;
	function;
	private downloadProgress: { progress: number, speed: number, peers: number } = { progress: 0, speed: 0, peers: 0 };
	private room: Room;
	private ready = false;
	private readonly roomName: string;
	private eventReceived = false;
	private initialConnect = false;

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
		this.playerReady = false;
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

	updateReadyState($event) {
		this.ready = $event.detail.checked;
		this.emitReadyState();
	}

	async openAddToQueueModal() {
		const modal = await this._modal.create({
			component: TorrentAddComponent,
			componentProps: {
				room: this.room
			}
		});

		return await modal.present();
	}

	public hasManagerPermissions() {
		return this.room.Users.find(x => x.User._id === this.auth.userId).Role?.PermissionLevel > 0 || this.room.Owner === this.auth.userId;
	}

	private async initializePlayer(room: string) {
		try {
			this._socket.create();
			this.createPlayerListeners();
			this.room = await this._api.get(`rooms/${encodeURIComponent(room)}`);

			if (this.hasManagerPermissions())
				this.player.controls(true);
		} catch (e) {
			await this._router.navigate(['/tabs/rooms']);
			return;
		}

		this._orientation.onChange().subscribe(() => {
				setTimeout(x => this.player.dimension('width', window.innerWidth), 50);
			}
		);

		this._socket.on('progress', (currentProgress: { progress: number, speed: number, peers: number }) => {
			this.downloadProgress = currentProgress;
		});

		this._socket.on('ready', async () => {
			this.player.controls(true);
		});

		this._socket.on('done', () => {
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
				message: `${user.firstName} left the room!`,
				duration: 3000,
				position: 'top',
				color: 'danger'
			});

			if (user._id !== this.auth.userId)
				await jMsg.present();
		});

		this._socket.on('room:user:joined', async (user: User) => {
			const jMsg = await this._toast.create({
				message: `${user.firstName} joined the room!`,
				duration: 3000,
				position: 'top',
				color: 'success'
			});

			if (user._id !== this.auth.userId)
				await jMsg.present();
		});

		this._socket.on('room:user:online', (onlineUsers: string[]) => {
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
					message: `${user.firstName} was kicked from the room!`,
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
			if (this.initialConnect) {
				this.connectToRoom(room);
				this.emitReadyState();
			}

			await cMsg.present();
			await dcMsg.dismiss();
		});

		// Connect to the room and emit existing states
		this.connectToRoom(room);
		this.emitReadyState();
		this.initialConnect = true;
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

	private createPlayerListeners() {
		this.player = videojs(this.playerEl.nativeElement, {
			width: window.innerWidth,
			preload: 'all'
		});

		this.player.hide();

		this.player.on('loadedmetadata', (e) => {
			console.log(e);
			this.player.show();
			this.playerReady = true;
		});

		/* TODO: REPLACE THIS */
		this.player.src({ src: `${environment.endpoints.api}stream`, type: 'video/mp4' });


		/* PLAYER EVENT LISTENERS */
		this.player.on('pause', (e) => {
			if (this.eventReceived)
				this.eventReceived = false;
			else
				this._socket.emit('room:user:pause');
		});

		this.player.on('play', (e) => {
			if (this.eventReceived)
				this.eventReceived = false;
			else
				this._socket.emit('room:user:play', this.player.currentTime());
		});
		/* PLAYER EVENT END */

		this.player.on('waiting', (e) => {
			this._socket.emit('room:user:buffering');
		});

		this.player.on('playing', (e) => {
			this._socket.emit('room:user:buffering:done');
		});

		this._socket.on('room:player:play', async (data: { user: string, time: number }) => {
			if (data.user === this.auth.userId)
				return;

			this.eventReceived = true;
			this.player.currentTime(data.time);
			await this.player.play();
		});

		this._socket.on('room:player:pause', async (data: { user: string }) => {
			if (data.user === this.auth.userId)
				return;

			this.eventReceived = true;
			await this.player.pause();
		});

		this._socket.on('room:player:source', async (data: { user: string, source: string }) => {
			console.log(data);
		});
	}
}
