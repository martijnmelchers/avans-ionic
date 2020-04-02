import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as io from 'socket.io-client';
import Socket = SocketIOClient.Socket;
import Emitter = SocketIOClient.Emitter;

@Injectable({
	providedIn: 'root'
})
export class SocketService {
	private readonly _socket: SocketIOClient.Socket;

	constructor() {
		this._socket = io.connect(`${environment.endpoints.api}`);
	}

	get socket(): Socket {
		return this._socket;
	}

	on(event: string, fn: (...args: any[]) => void): Emitter {
		return this._socket.on(event, fn);
	};

	emit(event: string, ...args: any[]) {
		this._socket.emit(event, ...args);
	}
}
