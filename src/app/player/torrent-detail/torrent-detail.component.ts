import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Room } from '../../core/models/room';
import { TorrentStatus } from '../../core/models/torrent-status';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { QueueItem } from '../../core/models/queue-item';

@Component({
	selector: 'app-torrent-detail',
	templateUrl: './torrent-detail.component.html',
	styleUrls: ['./torrent-detail.component.scss']
})
export class TorrentDetailComponent implements OnInit {
	@Input() room: Room;
	@Input() queueItem: QueueItem;

	constructor(private _modal: ModalController, public auth: AuthService, private _api: ApiService) {
	}

	ngOnInit() {
	}

	async removeFromQueue() {
	  await this._api.delete(`rooms/${encodeURIComponent(this.room.Id)}/queue/${this.queueItem.Position}`);
	  await this.closeModal();
    }

	public async closeModal() {
		await this._modal.dismiss({
			dismissed: true
		});
	}

}
