import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastController } from '@ionic/angular';
import videojs from 'video.js';
import { SocketService } from '../core/services/socket.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { ActivatedRoute, Router } from '@angular/router';
import { Room } from '../core/models/room';
import { ApiService } from '../core/services/api.service';
import { AuthService } from '../core/services/auth.service';

@Component({
	selector: 'app-player',
	templateUrl: './player.page.html',
	styleUrls: ['./player.page.scss']
})
export class PlayerPage implements OnInit {
	@ViewChild('sourceEl', { static: true }) source;
	@ViewChild('playerEl', { static: true }) playerEl;
	public player: videojs.Player;
	private downloadProgress: { progress: number, speed: number, peers: number } = { progress: 0, speed: 0, peers: 0 };
	private room: Room;

	constructor(private _toast: ToastController, private _socket: SocketService,
				private _orientation: ScreenOrientation, private _router: Router,
				private _route: ActivatedRoute, private _api: ApiService,
				public auth: AuthService) {
		Promise.all([this.initializePlayer(this._route.snapshot.paramMap.get('name'))]);
	}

	public get progress() {
		return this.downloadProgress.progress;
	}

	public get buffer() {
		return this.player?.bufferedPercent();
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
		this._socket.socket.removeAllListeners();
		this._socket.socket.close();
	}

	public async deleteRoom() {
		if (this.room.Owner !== this.auth.userId)
			return;

		try {
			await this._api.delete(`rooms/${encodeURIComponent(this.room.Id)}`);
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

		const eMsg = await this._toast.create({
			message: 'This room does not exist or you are not in this room',
			duration: 2000
		});

		/* ROOM EVENTS */
		this._socket.on('room:error', async (error: string) => {
			await eMsg.present();
			await this._router.navigate(['/']);
		});

		this._socket.on('room:deleted', async () => {
			await this._router.navigate(['/']);
		});

		/* END ROOM EVENTS */

		this._socket.on('disconnect', async () => {
			await dcMsg.present();
			this.player.controls(false);
			this.player.pause();
		});

		this._socket.on('connect', async () => {
			await cMsg.present();
			await dcMsg.dismiss();
		});

	}
}
