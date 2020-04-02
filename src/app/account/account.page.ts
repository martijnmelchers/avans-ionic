import { Component } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account',
  templateUrl: 'account.page.html',
  styleUrls: ['account.page.scss']
})
export class AccountPage {

  constructor(private auth: AuthService, private router: Router) {}

  async logout() {
    this.auth.logout();
    await this.router.navigate(['login'])
  }

}
