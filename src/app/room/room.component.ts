import { Component, OnInit } from '@angular/core';
import { Room, RoomService } from '../room.service';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
	selector: 'app-room',
	templateUrl: './room.component.html',
	styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {
	private room: Room;

	constructor(private _roomService: RoomService, public auth: AuthService) {
	}

	ngOnInit() {
		this._roomService.GetRoom().subscribe((room) => {
			this.room = room;
		});
	}

	joinRoom(form: NgForm) {
		const roomName: string = form.value.roomName;
		this._roomService.JoinRoom(roomName);
	}

	createRoom(form: NgForm) {
		const roomName: string = form.value.roomName;
		this._roomService.CreateRoom(roomName);
	}
}
