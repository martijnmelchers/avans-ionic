import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { Observable } from 'rxjs';


class QueueItem {
	magnet: string;
	Id: string;
}

class User {
	_id: string;
	email: string;
	salt: string;
	hash: string;
}

export class Room {
	Id: string;
	Users: User[];
	Queue: QueueItem[];
	Owner: string;
    Password: boolean;
}


@Injectable({
	providedIn: 'root'
})
export class RoomService {

	constructor(private socketService: SocketService) {
	}

	getRoom(): Observable<Room> {
		return new Observable<Room>((observer) => {
			this.socketService.on('room:connected', (data: Room) => {
				observer.next(data);
			});

			this.socketService.on('room:updated', (data: Room) => {
				observer.next(data);
			});
		});
	}

	// Create or join.
	joinRoom(room: string) {
		this.socketService.emit('connectRoom', {
			room,
			user: localStorage.getItem('jwt')
		});

		localStorage.setItem('roomId', room);
	}

	GetCurrentRoom() {
		return localStorage.getItem('roomId');
	}

	public AddToQueue(): any {
		this.socketService.emit('addToQueue', {
			magnet: 'magnet:?xt=urn:btih:B6E82665EF588BB6574DB1F9780A0279274F407D&dn=Aquaman+%282018%29+%5BWEBRip%5D+%5B1080p%5D+%5BYTS%5D+%5BYIFY%5D&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.com%3A2710%2Fannounce&tr=udp%3A%2F%2Fp4p.arenabg.com%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.zer0day.to%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Fcoppersurfer.tk%3A6969%2Fannounce',
			room: this.GetCurrentRoom()
		});
	}
}
