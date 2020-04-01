import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../core/services/api.service';

@Component({
	selector: 'app-create-room',
	templateUrl: 'create-room.page.html',
	styleUrls: ['create-room.page.scss']
})
export class CreateRoomPage {

	constructor(private _api: ApiService, private _alert: AlertController,
				private _router: Router, private _loading: LoadingController) {
	}

	async createRoom(form: NgForm) {
		const loading = await this._loading.create({
			message: 'Creating room...'
		});

		if (form.invalid) {
			const invalidFormAlert = await this._alert.create({
				header: 'Missing information',
				message: 'Please fill out the form before submitting!',
				buttons: ['OK']
			});
			await invalidFormAlert.present();
			return;
		}

		try {
			await loading.present();
			await this._api.post('rooms', {Id: form.value.name, password: form.value.password});
			form.resetForm();
			await this._router.navigate(['/']);
			await loading.dismiss();
		} catch (e) {
			console.log(e);
			const invalidCredentialsAlert = await this._alert.create({
				header: 'Room already exists!',
				message: 'A room with this name already exists, please choose another name and try again.',
				buttons: ['OK']
			});
			await loading.dismiss();
			await invalidCredentialsAlert.present();
		}

	}

	onEnter(event: KeyboardEvent, form: NgForm) {
		if (event.key === 'Enter') {
			this.createRoom(form);
		}
	}

}
