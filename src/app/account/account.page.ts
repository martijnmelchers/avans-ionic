import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';
import { User } from '../core/models/user';
import { ApiService } from '../core/services/api.service';
import { CameraDirection, CameraResultType, CameraSource, Plugins } from '@capacitor/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastController } from '@ionic/angular';

@Component({
	selector: 'app-account',
	templateUrl: 'account.page.html',
	styleUrls: ['account.page.scss']
})
export class AccountPage {
	private account: User = new User();
	private photo: any;

	constructor(private auth: AuthService, private router: Router, private _api: ApiService, private sanitizer: DomSanitizer, private _toast: ToastController) {

	}

	async ionViewDidEnter() {
		this.account = await this._api.get('users/me');
		this.photo = this.account?.profilePicture ?? '';
	}

	async logout() {
		this.auth.logout();
		await this.router.navigate(['login']);
	}

	async deleteAccount() {
		await this._api.delete('users');
		this.auth.logout();
		await this.router.navigate(['login']);
	}

	async openCamera() {
		try {
			const image = await Plugins.Camera.getPhoto({
				quality: 100,
				allowEditing: false,
				resultType: CameraResultType.DataUrl,
				source: CameraSource.Prompt,
				direction: CameraDirection.Front
			});

			this.photo = image.dataUrl;

			try {
				await this._api.put(`users/me`, { profilePicture: this.photo });

			} catch (e) {
				const eMsg = await this._toast.create({
					message: `Oops! Your profile picture wasn't saved :(`,
					duration: 1500,
					position: 'top',
					color: 'danger'
				});

				await eMsg.present();

				this.photo = null;
			}
		} catch (e) {
			const eMsg = await this._toast.create({
				message: `Oops! You either cancelled the operation or didn't give us camera access`,
				duration: 1500,
				position: 'top',
				color: 'danger'
			});

			await eMsg.present();
		}
	}
}
