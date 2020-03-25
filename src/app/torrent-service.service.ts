import { Injectable } from '@angular/core';
import WebTorrent from 'webtorrent';

@Injectable({
  providedIn: 'root'
})
export class TorrentServiceService {
    client: WebTorrent.Instance;

    constructor() {
        this.client = new WebTorrent();
    }

    startTorrent(link: string, callback: (file: WebTorrent.TorrentFile) => void): void {
        // tslint:disable-next-line: no-unused-expression
        this.client.add(link, (torrent: WebTorrent.Torrent) => {
            let videofile = null;
            console.log(torrent);
            videofile =  torrent.files.find((file) => {
                return file.name.endsWith('.mp4')
            });

            callback(videofile);
        });
    }
}
