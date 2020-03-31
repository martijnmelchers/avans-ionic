import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(private _authService: AuthService) { }

  ngOnInit() {
      console.log(this._authService.getTokenData());
  }

  async login(form:any){
    // Authservice login
    const response = await this._authService.login(form.value);
    console.log(response);  }
}
