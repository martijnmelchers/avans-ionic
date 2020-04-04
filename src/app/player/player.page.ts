import { Component, ViewChild } from '@angular/core';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import videojs from 'video.js';
import { SocketService } from '../core/services/socket.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { ActivatedRoute, Router } from '@angular/router';
import { Room } from '../core/models/room';
import { ApiService } from '../core/services/api.service';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/user';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { TorrentAddComponent } from './torrent-add/torrent-add.component';
import { HapticsImpactStyle, Plugins } from '@capacitor/core';
import { PlayerState } from '../core/models/player-state';
import { TorrentStatus } from '../core/models/torrent-status';
import { environment } from '../../environments/environment';

const { Haptics } = Plugins;

@Component({
	selector: 'app-player',
	templateUrl: './player.page.html',
	styleUrls: ['./player.page.scss']
})
export class PlayerPage {

	@ViewChild('sourceEl', { static: true }) source;
	@ViewChild('playerEl', { static: true }) playerEl;

	public player: videojs.Player;

	/* Data received via WebSockets */
	public onlineUsers: string[] = [];
	public readyUsers: string[] = [];
	public torrentStates: TorrentStatus[] = [];

	/* Internal states */
	public playerState: PlayerState = PlayerState.Loading;
	private room: Room;
	private readonly roomName: string;
	private eventReceived = false;
	private initialConnect = false;
	private isInitialized = false;
	private loading: HTMLIonLoadingElement;

	constructor(private _toast: ToastController, private _socket: SocketService,
				private _orientation: ScreenOrientation, private _router: Router,
				private _route: ActivatedRoute, private _api: ApiService,
				public auth: AuthService, private _modal: ModalController,
				private _loading: LoadingController) {
		this.roomName = this._route.snapshot.paramMap.get('name');
	}

	async ionViewDidEnter() {
		if (!this.isInitialized)
			await this.initializePlayer(this.roomName);
	}

	async ionViewDidLeave() {
		// Destroy sockets
		this._socket.destroy();
		// Dispose player state
		this.player.dispose();
		this.playerState = PlayerState.Uninitialized;
		// Reset booleans
		this.isInitialized = false;
		this.eventReceived = false;
		// Reset arrays back to empty state
		this.onlineUsers = [];
		this.readyUsers = [];
		this.torrentStates = [];
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
			this.isInitialized = true;
			await this.showConnecting();
			this._socket.create();
			this.createPlayerListeners();
			this.room = await this._api.get(`rooms/${encodeURIComponent(room)}`);

			if (this.hasManagerPermissions())
				this.player.controls(true);
		} catch (e) {
			console.error(e);
			await this._router.navigate(['/tabs/rooms']);

			return;
		}

		this._orientation.onChange().subscribe(() => {
				setTimeout(x => this.player.dimension('width', window.innerWidth), 50);
			}
		);

		this._socket.on('room:torrent:progress', (data: TorrentStatus) => {
			const existing = this.torrentStates.find(x => x.hash === data.hash);
		});

		this._socket.on('room:torrent:ready', async () => {
			this.player.controls(true);
		});

		this._socket.on('room:torrent:done', (hash: string) => {

		});
		const dcMsg = await this._toast.create({ message: 'Server disconnected you! Please wait while we reconnect... ' });
		const cMsg = await this._toast.create({
			message: 'You\'re connected! Happy streaming!',
			duration: 2000
		});


		/* ROOM EVENTS */
		this._socket.on('room:connected', async () => {
			await this.hideConnecting();
			this.initialConnect = true;
			if (this.room.Queue.length === 0)
				this.playerState = PlayerState.NothingPlaying;
			else
				this.player.src({
					src: `${environment.endpoints.api}stream/${this.getFirstQueueItem().InfoHash}`,
					type: 'video/mp4'
				});
		});

		this._socket.on('room:updated', async (newRoom: Room) => {
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

				Haptics.impact({ style: HapticsImpactStyle.Heavy });
				Haptics.vibrate();

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
				this.showConnecting();
				this.connectToRoom(room);
			}

			await cMsg.present();
			await dcMsg.dismiss();
		});

		// Connect to the room
		this.connectToRoom(room);
	}

	private connectToRoom(room: string) {
		this._socket.emit('room:connect', {
			room,
			user: this.auth.getToken()
		});
	}

	private createPlayerListeners() {
		this.player = videojs(this.playerEl.nativeElement, {
			width: window.innerWidth,
			preload: 'all'
		});

		this.player.hide();

		this.player.on('loadedmetadata', (e) => {
			console.log('metadata ready!');
			this.player.show();
			this.playerState = PlayerState.Ready;
		});

		this.player.on('error', () => {
			this.playerState = PlayerState.Error;
		});


		// else
		// 	this.player.src({ src: `${environment.endpoints.api}stream/${this.getFirstQueueItem()}`, type: 'video/mp4'});

		/* TODO: REPLACE THIS */
		// this.player.src({ src: `${environment.endpoints.api}stream/${this.room.Queue[0].}`, type: 'video/mp4' });


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

	private getFirstQueueItem() {
		return this.room.Queue.find(x => x.Position === 1);
	}

	private async showConnecting() {
		this.loading = await this._loading.create({
			message: 'Connecting to room...'
		});
		await this.loading.present();
	}

	private async hideConnecting() {
		await this.loading.dismiss();
	}
}
