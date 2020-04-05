import { Component, Input, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Room } from '../../core/models/room';

@Component({
	selector: 'app-invite-user',
	templateUrl: './invite-user.component.html',
	styleUrls: ['./invite-user.component.scss']
})
export class InviteUserComponent implements OnInit {
	@Input() public room: Room;

	constructor(private _modal: ModalController, private _api: ApiService, private _toast: ToastController) {
	}

	ngOnInit() {
	}

	public async inviteUser(form: NgForm) {
		try {
			await this._api.post(`rooms/${this.room.Id}/users`, form.value);
			await this.closeModal();
		} catch (e) {
			const eMsg = await this._toast.create({
				message: `User already in room or invalid email!`,
				duration: 3000,
				position: 'top',
				color: 'danger'
			});
			await this.closeModal();
			await eMsg.present();
		}
	}

	public async closeModal() {
		await this._modal.dismiss({
			dismissed: true
		});
	}

}
