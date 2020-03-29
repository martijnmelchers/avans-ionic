import {Component, OnInit} from '@angular/core';
import {TorrentServiceService} from '../torrent-service.service';
import * as io from 'socket.io-client';
import Socket = SocketIOClient.Socket;
import {environment} from "../../environments/environment";

@Component({
    selector: 'app-player',
    templateUrl: './player.page.html',
    styleUrls: ['./player.page.scss'],
})
export class PlayerPage implements OnInit {
    private readonly socket: Socket;

    constructor(private torentService: TorrentServiceService) {
        this.socket = io.connect(`${environment.endpoints.api}`);

    }

    ngOnInit() {
    }

    async startVideo() {
        // const torrentId = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent';
        // const file = await this.torentService.startTorrent(torrentId);
        // file.appendTo('#wrapper');
    }
}
