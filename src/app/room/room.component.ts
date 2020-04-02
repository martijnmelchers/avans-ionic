import { Component, OnInit } from '@angular/core';
import { Room, RoomService } from '../core/services/room.service';
import { AuthService } from '../core/services/auth.service';
import { ApiService } from '../core/services/api.service';
import { Router } from '@angular/router';

@Component({
	selector: 'app-room',
	templateUrl: './room.component.html',
	styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {
	private room: Room;

	constructor(private _roomService: RoomService, public auth: AuthService, private _api: ApiService, private _router: Router) {
	}

	ngOnInit() {
		this._roomService.getRoom().subscribe((room) => {
			this.room = room;
		});
	}

	public async deleteRoom() {
		if (this.room.Owner !== this.auth.userId)
			return;

		try {
			await this._api.delete(`rooms/${encodeURIComponent(this.room.Id)}`);
			await this._router.navigate(['/tabs/rooms']);
		} catch(e) {

		}

	}

	public async leaveRoom() {
		if (this.room.Owner === this.auth.userId)
			return;

		await this._api.delete(`rooms/${encodeURIComponent(this.room.Id)}/leave`);
		await this._router.navigate(['/tabs/rooms']);
	}
}
