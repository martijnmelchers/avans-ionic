import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Room } from '../../core/models/room';
import { User } from '../../core/models/user';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-user-detail',
	templateUrl: './user-detail.component.html',
	styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {
	public room: Room;
	public user: User;

	constructor(public auth: AuthService, private _api: ApiService, private _route: ActivatedRoute) {

	}

	async ngOnInit() {
		const roomName = this._route.snapshot.paramMap.get('name');
		const userEmail = this._route.snapshot.paramMap.get('email');

		this.room = await this._api.get(`rooms/${encodeURIComponent(roomName)}`);
		this.user = await this._api.get(`rooms/${encodeURIComponent(roomName)}/${encodeURIComponent(userEmail)}`);
	}

}
