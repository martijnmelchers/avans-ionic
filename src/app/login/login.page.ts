import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { NgForm } from '@angular/forms';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { AlertController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {


    constructor(private _auth: AuthService, private _iab: InAppBrowser,
                private _alert: AlertController, private _router: Router,
                private _loading: LoadingController) {
        if (this._auth.loggedIn)
            this._router.navigate(['/']);
    }

    async ngOnInit() {

    }

    loginWithGoogle() {
        this._iab.create('http://google.com');
    }

    loginWithFacebook() {
        this._iab.create('https://facebook.com');
    }

    async login(form: NgForm) {
        const loading = await this._loading.create({
            message: 'Logging you in...'
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
            await this._auth.login(form.value);
            form.resetForm();
            await this._router.navigate(['/']);
            await loading.dismiss();
        } catch (e) {
            const invalidCredentialsAlert = await this._alert.create({
                header: 'Invalid credentials!',
                message: 'Invalid username and/or password, check your credentials and try again',
                buttons: ['OK']
            });
            await loading.dismiss();
            await invalidCredentialsAlert.present();
        }

    }

    onEnter(event: KeyboardEvent, form: NgForm) {
        if (event.key === 'Enter') {
            this.login(form);
        }
    }
}
