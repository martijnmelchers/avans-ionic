import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastController } from '@ionic/angular';
import videojs from 'video.js';
import { SocketService } from '../core/services/socket.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { ActivatedRoute, Router } from '@angular/router';
import { Room } from '../core/models/room';
import { ApiService } from '../core/services/api.service';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/user';

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
	private downloadProgress: { progress: number, speed: number, peers: number } = { progress: 0, speed: 0, peers: 0 };
	private room: Room;
	private roomName: string;

	constructor(private _toast: ToastController, private _socket: SocketService,
				private _orientation: ScreenOrientation, private _router: Router,
				private _route: ActivatedRoute, private _api: ApiService,
				public auth: AuthService) {
		this.roomName = this._route.snapshot.paramMap.get('name');
	}

	async ionViewDidEnter() {
		await this.initializePlayer(this.roomName);
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

	ngOnInit() {

	}

	async ionViewWillLeave() {
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

	private async initializePlayer(room: string) {
		try {
			this._socket.create();
			this.room = await this._api.get(`rooms/${encodeURIComponent(room)}`);
		} catch (e) {
			await this._router.navigate(['/tabs/rooms']);
			return;
		}

		this._orientation.onChange().subscribe(() => {
				setTimeout(x => this.player.dimension('width', window.innerWidth), 50);
			}
		);

		this.player = videojs(this.playerEl.nativeElement, {
			width: window.innerWidth,
			preload: 'all'
		});

		this.player.controls(true);

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
			console.log(onlineUsers)
			this.onlineUsers = onlineUsers;
		});

		/* END USER EVENTS */


		this._socket.on('disconnect', async () => {
			await dcMsg.present();
			this.player.controls(false);
			this.player.pause();
		});

		this._socket.on('connect', async () => {
			console.log('connect run');
			this.connectToRoom(room);
			await cMsg.present();
			await dcMsg.dismiss();
		});

		this.connectToRoom(room);

	}

	private connectToRoom(room: string) {
		console.log(`Attempt connect to: ${room}`);
		this._socket.emit('room:connect', {
			room,
			user: this.auth.getToken()
		});
	}
}
