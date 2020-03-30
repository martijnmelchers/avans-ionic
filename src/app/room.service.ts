import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { Observable, observable } from 'rxjs';



class QueueItem{
    magnet: string;
    position: number;
}

class Queue {
    private Items: QueueItem[];
    private Current: QueueItem;
    constructor(){}

    GetCurrentItem(){
        return this.Current;
    }
}



@Injectable({
  providedIn: 'root'
})
export class RoomService {
    public Queue: Observable<Queue>;

    constructor(private socketService: SocketService) {


        this.Queue = new Observable<Queue>((observer) => {
            let queueInstance = new Queue();

            this.socketService.GetSocket().on('removeFromQueue', () => observer.next(queueInstance));
            this.socketService.GetSocket().on('addToQueue', () => {
                observer.next(queueInstance);
            });
        });
    }

    // Create or join.
    JoinRoom(room: string){
        // tslint:disable-next-line: object-literal-shorthand
        this.socketService.GetSocket().emit('joinRoom', {room: room});
        localStorage.setItem('roomId', room);
    }

    GetCurrentRoom(){
        return localStorage.getItem('roomId');
    }

    public AddToQueue(): any{
        this.socketService.GetSocket().emit('addToQueue', {magnet: 'magnet:?xt=urn:btih:B6E82665EF588BB6574DB1F9780A0279274F407D&dn=Aquaman+%282018%29+%5BWEBRip%5D+%5B1080p%5D+%5BYTS%5D+%5BYIFY%5D&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969%2Fannounce&tr=udp%3A%2F%2F9.rarbg.com%3A2710%2Fannounce&tr=udp%3A%2F%2Fp4p.arenabg.com%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.zer0day.to%3A1337%2Fannounce&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969%2Fannounce&tr=udp%3A%2F%2Fcoppersurfer.tk%3A6969%2Fannounce', room: this.GetCurrentRoom()});
    }
}
