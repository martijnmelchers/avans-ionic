import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Room } from '../../core/models/room';
import { User } from '../../core/models/user';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
	selector: 'app-user-detail',
	templateUrl: './user-detail.component.html',
	styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {
	@Input() public room: Room;
	@Input() public email: string;

	public user: User;
	public roles: any;

	constructor(public auth: AuthService, private _api: ApiService, private _modal: ModalController) {

	}

	async ngOnInit() {
		console.log(this.room);
		console.log(this.email);
		this.user = await this._api.get(`rooms/${encodeURIComponent(this.room.Id)}/users/${encodeURIComponent(this.email)}`);
		this.roles = this.room.Users.find((usr) => usr.User.email === this.email).Role;
		console.log(this.roles);
	}

	async kickUser() {
		if (this.auth.userId !== this.room.Owner)
			return;

		await this._api.delete(`rooms/${encodeURIComponent(this.room.Id)}/users/${encodeURIComponent(this.user.email)}`);
	}

	public async closeModal() {
		// using the injected ModalController this page
		// can "dismiss" itself and optionally pass back data
		await this._modal.dismiss({
			dismissed: true
		});
	}

}
