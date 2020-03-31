import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'app-register',
    templateUrl: './register.page.html',
    styleUrls: ['./register.page.scss']
})
export class RegisterPage implements OnInit {

    constructor(private _authService: AuthService) {
    }

    ngOnInit() {
    }

    async register(form: NgForm) {
        const response = await this._authService.register(form.value);
        console.log(response);
    }

    onEnter(event: KeyboardEvent, form: NgForm) {
        if (event.key === 'Enter') {
            this.register(form);
        }
    }
}
