import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';
import { User } from '../core/models/user';
import { ApiService } from '../core/services/api.service';
import { CameraResultType, CameraSource, Plugins } from '@capacitor/core';

@Component({
	selector: 'app-account',
	templateUrl: 'account.page.html',
	styleUrls: ['account.page.scss']
})
export class AccountPage implements OnInit {
	private account: User = new User();
	private currentImage: string;

	constructor(private auth: AuthService, private router: Router, private _api: ApiService) {

	}

	async ngOnInit() {
		this.account = await this._api.get('users/me');
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
		const image = await Plugins.Camera.getPhoto({
			quality: 100,
			allowEditing: false,
			resultType: CameraResultType.DataUrl,
			source: CameraSource.Camera
		});

		console.log(image);
	}
}
