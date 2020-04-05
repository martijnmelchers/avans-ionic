import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Room } from '../../core/models/room';
import { User } from '../../core/models/user';
import { ModalController, ToastController } from '@ionic/angular';
import { Role } from '../../core/models/role';
import { QueueItem } from '../../core/models/queue-item';
import { UserTorrentDetailComponent } from './user-torrent-detail/user-torrent-detail.component';

@Component({
	selector: 'app-user-detail',
	templateUrl: './user-detail.component.html',
	styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {
	@Input() public room: Room;
	@Input() public email: string;

	public user: User;
	public role: Role;
	public queue: QueueItem[] = [];

	constructor(public auth: AuthService, private _api: ApiService, private _modal: ModalController,
				private _toast: ToastController) {

	}

	async ngOnInit() {
		this.user = await this._api.get(`rooms/${encodeURIComponent(this.room.Id)}/users/${encodeURIComponent(this.email)}`);
		this.queue = await this._api.get(`rooms/${encodeURIComponent(this.room.Id)}/users/${encodeURIComponent(this.email)}/queue`);
		this.role = this.room.Users.find((usr) => usr.User.email === this.email).Role;
	}

	async kickUser() {
		if (this.auth.userId !== this.room.Owner)
			return;

		await this._api.delete(`rooms/${encodeURIComponent(this.room.Id)}/users/${encodeURIComponent(this.user.email)}`);
		await this.closeModal();
	}

	public async closeModal() {
		await this._modal.dismiss({
			dismissed: true
		});
	}

	async changeRole($event: CustomEvent) {
		await this._api.put(`rooms/${encodeURIComponent(this.room.Id)}/users/${encodeURIComponent(this.user.email)}`, { PermissionLevel: $event.detail.value });
		const sMsg = await this._toast.create({
			message: `Role changed!`,
			duration: 1500,
			position: 'top',
			color: 'success'
		});

		await sMsg.present();
	}

	getReleaseYear(releaseDate: string) {
		const date = new Date(releaseDate);
		return date.getFullYear();
	}

	async openTorrentDetailModal(queue: QueueItem) {
		const modal = await this._modal.create({
			component: UserTorrentDetailComponent,
			componentProps: {
				index: queue.Position,
				room: this.room,
				email: this.email
			}
		});

		await modal.present();
	}
}
