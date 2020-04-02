import { User } from './user';
import { QueueItem } from './queue-item';

export class Room {
	Id: string;
	Users: User[];
	Queue: QueueItem[];
	Owner: string;
	Password: boolean;
}
