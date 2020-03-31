import { Component, OnInit } from '@angular/core';
import {Room, RoomService} from '../room.service';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent implements OnInit {
  constructor(private _roomService: RoomService) { }
  private room: Room;
  ngOnInit() {
      this._roomService.GetRoom().subscribe((room) => {
          this.room = room;
      })
  }

  joinRoom(form: NgForm){
      const roomName: string = form.value.roomName;
      this._roomService.JoinRoom(roomName);
  }

  createRoom(form:NgForm){
      const roomName: string = form.value.roomName;
      this._roomService.CreateRoom(roomName);
  }
}
