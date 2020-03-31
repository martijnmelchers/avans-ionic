import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { NgForm } from '@angular/forms';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
    selector: 'app-register',
    templateUrl: './register.page.html',
    styleUrls: ['./register.page.scss']
})
export class RegisterPage implements OnInit {

    constructor(private _auth: AuthService, private _iab: InAppBrowser,
                private _alert: AlertController, private _router: Router,
                private _loading: LoadingController) {
        if(this._auth.loggedIn)
            this._router.navigate(['/'])
    }

    ngOnInit() {
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
}
