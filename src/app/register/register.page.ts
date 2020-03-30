import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Form } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  constructor(private _authService: AuthService) { }

  ngOnInit() {
  }

  async register(form:Form) {
    const response = await this._authService.register(form.value);
    console.log(response);
  }
}
