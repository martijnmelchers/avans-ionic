import { QueueItem } from './queue-item';
import { RoomUser } from './room-user';

export class Room {
	Id: string;
	Users: RoomUser[];
	Queue: QueueItem[];
	Owner: string;
	Password: boolean;
}
