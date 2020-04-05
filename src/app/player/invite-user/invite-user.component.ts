import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
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

	constructor(private _modal: ModalController, private _api: ApiService) {
	}

	ngOnInit() {
	}

	public async inviteUser(form: NgForm) {
		await this._api.post(`rooms/${this.room.Id}/users`, form.value);
	}

	public async closeModal() {
		await this._modal.dismiss({
			dismissed: true
		});
	}

	onEnter(event: KeyboardEvent, form: NgForm) {
		if (event.key === 'Enter') {
			this.inviteUser(form);
		}
	}

}
