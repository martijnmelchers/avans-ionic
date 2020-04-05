import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as io from 'socket.io-client';
import Socket = SocketIOClient.Socket;
import Emitter = SocketIOClient.Emitter;

@Injectable({
	providedIn: 'root'
})
export class SocketService {
	constructor() {
	}

	private _socket: SocketIOClient.Socket;

	get socket(): Socket {
		return this._socket;
	}

	public create() {
		this._socket = io.connect(`${environment.endpoints.api}`);
	}

	public destroy() {
		this._socket.removeAllListeners();
		this._socket.close();
	}

	on(event: string, fn: (...args: any[]) => void): Emitter {
		return this._socket.on(event, fn);
	};

	once(event: string, fn: (...args: any[]) => void): Emitter {
		return this._socket.once(event, fn);
	}

	emit(event: string, ...args: any[]) {
		this._socket.emit(event, ...args);
	}
}
