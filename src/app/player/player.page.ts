import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastController } from '@ionic/angular';
import videojs from 'video.js';
import { SocketService } from '../core/services/socket.service';
import { RoomService } from '../core/services/room.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { ActivatedRoute, Router } from '@angular/router';

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
	private closed = false;

	constructor(private toastController: ToastController, private socketService: SocketService,
				private roomService: RoomService, private screenOrientation: ScreenOrientation,
				private router: Router, private route: ActivatedRoute) {
		const room = this.route.snapshot.paramMap.get('name');


		console.log(room);

		Promise.all([this.initSocket(room)]);
	}

	public get progress() {
		return this.downloadProgress.progress;
	}

	public get buffer() {
		return this.player.bufferedPercent();
	}

	public get peers() {
		return this.downloadProgress.peers;
	}

	public get speed() {
		return Math.round(((this.downloadProgress.speed / 1000000) + Number.EPSILON) * 100) / 100;
	}

	ngOnInit() {
		this.screenOrientation.onChange().subscribe(() => {
				setTimeout(x => this.player.dimension('width', window.innerWidth), 50);
			}
		);

		this.player = videojs(this.playerEl.nativeElement, {
			width: window.innerWidth,
			preload: 'all'
		});

		this.player.controls(true);
		this.roomService.AddToQueue();
	}

	async startVideo() {
		// const torrentId = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent';
		// const file = await this.torentService.startTorrent(torrentId);
		// file.appendTo('#wrapper');
	}

	private async initSocket(room: string) {
		this.socketService.on('progress', (currentProgress: { progress: number, speed: number, peers: number }) => {
			this.downloadProgress = currentProgress;
		});


		this.socketService.on('ready', async () => {
			this.player.controls(true);

		});

		this.socketService.on('done', () => {
			this.downloadProgress.progress = 1;
		});
		const dcMsg = await this.toastController.create({ message: 'Server disconnected you! Please wait while we reconnect... ' });
		const cMsg = await this.toastController.create({
			message: 'You\'re connected! Happy streaming!',
			duration: 2000
		});

		const eMsg = await this.toastController.create({
			message: 'This room does not exist or you are not in this room',
			duration: 2000
		});

		/* ROOM EVENTS */
		this.socketService.on('room:error', async (error: string) => {
			await eMsg.present();
			await this.router.navigate(['/']);
		});

		this.socketService.on('room:deleted', async () => {
			await this.router.navigate(['/']);
		});

		/* END ROOM EVENTS */

		this.socketService.on('disconnect', async () => {
			await dcMsg.present();
			this.player.controls(false);
			this.player.pause();
		});

		this.socketService.on('connect', async () => {
			await cMsg.present();
			await dcMsg.dismiss();
		});

		this.roomService.joinRoom(room);
	}

	async ionViewWillLeave() {
		this.socketService.socket.removeAllListeners();
		this.socketService.socket.close();
	}
}
