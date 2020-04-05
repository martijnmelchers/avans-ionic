import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ApiService } from '../../../core/services/api.service';
import { QueueItem } from '../../../core/models/queue-item';

@Component({
	selector: 'app-user-torrent-detail',
	templateUrl: './user-torrent-detail.component.html',
	styleUrls: ['./user-torrent-detail.component.scss']
})
export class UserTorrentDetailComponent implements OnInit {
	@Input() index;
	@Input() room;
	@Input() email;

	private queueItem: QueueItem;

	constructor(private _api: ApiService, private _modal: ModalController) {
	}

	async ngOnInit() {
      this.queueItem = await this._api.get(`rooms/${encodeURIComponent(this.room.Id)}/users/${encodeURIComponent(this.email)}/queue/${this.index}`);
	}

	public async closeModal() {
		await this._modal.dismiss({
			dismissed: true
		});
	}

}
