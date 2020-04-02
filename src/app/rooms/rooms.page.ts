import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/services/api.service';
import { Room } from '../core/models/room';

@Component({
	selector: 'app-tab1',
	templateUrl: 'rooms.page.html',
	styleUrls: ['rooms.page.scss']
})
export class RoomsPage implements OnInit {
	private rooms: Room[] = [];

	constructor(private _api: ApiService) {

	}

	async ngOnInit() {
		await this.getRooms();
	}

	async ionViewWillEnter() {
		await this.getRooms();
	}

	async ionViewDidEnter() {
		await this.getRooms();
	}

	async doRefresh($event) {
		await this.getRooms();
		$event.target.complete();
	}

	private async getRooms() {
		this.rooms = await this._api.get('users/room');
	}

}
