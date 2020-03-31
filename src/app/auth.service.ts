import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Form } from '@angular/forms';
import { RequestOptions } from './requestoptions';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private apiService: ApiService) { }

  public async login(form: any): Promise<any>{

    const postData :object = {
        user: {
            email: form.email,
            password: form.password
        },
    }

    let user:any  =  await this.apiService.post('/users/login', postData);
    user = user.user;

    this.saveToken(user);
    return user;
  }

  public async register(form: any): Promise<any>{

    const postData :object = {
        user: {
            email: form.email,
            password: form.password
        },
    }
    let user:any =  await this.apiService.post('/users', postData);
    user = user.user;
    this.saveToken(user);
    return user;
  }

  public getTokenData(): object {
      const data: object  = jwt_decode(this.getToken());
      return data;
  }

  public getToken(){
      return localStorage.getItem('jwt');
  }
  private saveToken(user: any){
        localStorage.setItem('jwt', user.token);
  }
}
