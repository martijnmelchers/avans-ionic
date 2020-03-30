import {Component, OnInit, ViewChild} from '@angular/core';
import * as io from 'socket.io-client';
import {environment} from '../../environments/environment';
import {ToastController} from "@ionic/angular";
import Socket = SocketIOClient.Socket;
import videojs from 'video.js';

@Component({
    selector: 'app-player',
    templateUrl: './player.page.html',
    styleUrls: ['./player.page.scss'],
})
export class PlayerPage implements OnInit {
    @ViewChild('source', {static: true}) source;
   @ViewChild('player', {static: true}) playerEl;
   private player: videojs.Player;
    private socket: Socket;
    private downloadProgress: { progress: number, speed: number, peers: number } = {progress: 0, speed: 0, peers: 0};

    constructor(private toastController: ToastController) {
        Promise.all([this.initSocket()])
    }

    public get progress() {
        return this.downloadProgress.progress;
    }

    public get peers() {
        return this.downloadProgress.peers
    }

    public get speed() {
        return Math.round(((this.downloadProgress.speed / 1000000) + Number.EPSILON) * 100) / 100;
    }

    ngOnInit() {
        this.player = videojs(this.playerEl.nativeElement);
        this.player.on("metdataready", () => {

        })
    }

    async startVideo() {
        // const torrentId = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent';
        // const file = await this.torentService.startTorrent(torrentId);
        // file.appendTo('#wrapper');
    }

    private async initSocket() {
        this.socket = io.connect(`${environment.endpoints.api}`);
        this.socket.on('progress', (currentProgress: { progress: number, speed: number, peers: number }) => {
            this.downloadProgress = currentProgress;
        });

        this.socket.on('ready', async () => {
            console.log('READY EVENT RECEIVED!');
            this.player.play()
        });

        this.socket.on('done', () => {
            this.downloadProgress.progress = 1;
        });
        const dcMsg = await this.toastController.create({message: 'Server disconnected you! Please wait while we reconnect... '});
        const cMsg = await this.toastController.create({
            message: 'You\'re connected! Happy streaming!',
            duration: 2000
        });
        this.socket.on('disconnect', async () => {
            await dcMsg.present();
            this.player.pause();
        });
        this.socket.on('connect', async () => {


            await cMsg.present();
            await dcMsg.dismiss();
        });
    }
}
