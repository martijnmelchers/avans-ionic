import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { NgForm } from '@angular/forms';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../core/services/api.service';
import { GooglePlus } from '@ionic-native/google-plus/ngx';

declare let gapi: any;

@Component({
	selector: 'app-register',
	templateUrl: './register.page.html',
	styleUrls: ['./register.page.scss']
})
export class RegisterPage implements OnInit {
	private auth2: any;

	constructor(private _auth: AuthService, private _iab: InAppBrowser,
				private _alert: AlertController, private _router: Router,
				private _loading: LoadingController, private _api: ApiService,
				private _google: GooglePlus) {
		if (this._auth.loggedIn)
			this._router.navigate(['/']);
	}

	async ngOnInit() {
		await this.loadScript('google', 'https://apis.google.com/js/platform.js', async () => {
			await gapi.load('client:auth2', async () => {
				this.auth2 = await gapi.auth2.init({
					apiKey: 'Yhsk6Y-_OBz3TXDIBZZHdjXg',
					client_id: '100369552874-hn54n3km6ddufj2mh5pmcr6qtibr14kh.apps.googleusercontent.com',
					scope: 'email'
				});
			});
		});
	}

	async register(form: NgForm) {
		const loading = await this._loading.create({
			message: 'Creating an account...'
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
			await this._auth.register(form.value);
			await this._router.navigate(['/']);
			await loading.dismiss();
		} catch (e) {
			const invalidCredentialsAlert = await this._alert.create({
				header: 'Account already exists!',
				message: 'An account with that email already exists, please try logging in or using another email',
				buttons: ['OK']
			});
			await invalidCredentialsAlert.present();
			await loading.dismiss();
		}
	}

	onEnter(event: KeyboardEvent, form: NgForm) {
		if (event.key === 'Enter') {
			this.register(form);
		}
	}

	public async registerWithGoogle() {
		// try {
		// 	const res = await this._google.login({});
		// 	console.log(res);
		// } catch (e) {
		// 	console.error(e);
		// }

		this._iab.create('http://localhost:5000/users/google', '_self');

		// await this.auth2.signIn();
		// console.log(await this._api.post(`users/google/${await this.auth2.currentUser.get().getAuthResponse(true).access_token}`, null));
	}

	public loadScript(id: string, src: string, onload: any): void {
		if (document.getElementById(id)) {
			return;
		}

		const signInJS = document.createElement('script');
		signInJS.async = true;
		signInJS.src = src;
		signInJS.onload = onload;
		document.head.appendChild(signInJS);
	}
}
