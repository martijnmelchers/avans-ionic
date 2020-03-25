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

    async startTorrent(link: string): Promise<WebTorrent.TorrentFile> {
        // tslint:disable-next-line: no-unused-expression
        return new Promise<WebTorrent.TorrentFile>(resolve => {
            this.client.add(link, (torrent: WebTorrent.Torrent) => {
                let videofile = null;
                console.log(torrent);
                videofile =  torrent.files.find((file) => {
                    return file.name.endsWith('.mp4')
                });

                resolve(videofile);
            });
        });
    }
}
