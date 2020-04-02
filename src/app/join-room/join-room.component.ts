import { Component, OnInit } from '@angular/core';
import { ApiService } from '../core/services/api.service';
import { Room } from '../core/services/room.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
	selector: 'app-join-room',
	templateUrl: './join-room.component.html',
	styleUrls: ['./join-room.component.scss']
})
export class JoinRoomComponent implements OnInit {
	public rooms: Room[] = [];
	private page = 1;
	private finished = false;

	constructor(private _api: ApiService, private _alert: AlertController,
				private _loading: LoadingController, private router: Router) {
	}

	async ngOnInit() {
		await this.fetchRooms(this.page++);
	}

	async fetchRooms(page: number) {
		const results = await this._api.get<Room[]>(`rooms/${page}`);
		if (results.length !== 20)
			this.finished = true;
		this.rooms = this.rooms.concat(results);
	}

	async loadData(event) {
		if (this.finished)
			return event.target.complete();

		await this.fetchRooms(this.page++);
		event.target.complete();
	}

	async joinRoom(room: Room) {
		const loading = await this._loading.create({
			message: 'Joining room...'
		});

		let password: string;

		if (room.Salt) {
			const passwordMsg = await this._alert.create({
				header: 'Enter room password',
				subHeader: 'This room is protected with a password, to enter please enter the password below.',
				inputs: [
					{
						name: 'password',
						type: 'password',
						label: 'Room password',
						placeholder: '********'
					}
				],
				buttons: [
					'Confirm'
				]
			});

			await passwordMsg.present();
			const response = await passwordMsg.onDidDismiss();

			password = response.data?.values?.password;
		}
		await loading.present();

		try {
			await this._api.post(`rooms/${encodeURIComponent(room.Id)}`, { password });
			await this.router.navigate(['player', room.Id]);
			await loading.dismiss();
		} catch (e) {
			const invalidPasswordMsg = await this._alert.create({
				header: 'Invalid password!',
				subHeader: 'Please enter a different password and try again!',
				buttons: ['OK']
			});
			await loading.dismiss();
			await invalidPasswordMsg.present();
		}
	}
}
