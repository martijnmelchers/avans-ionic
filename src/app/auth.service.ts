import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Form } from '@angular/forms';
import { RequestOptions } from './requestoptions';

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

    return this.apiService.post('/users/login', postData);
  }


  public async register(form: any): Promise<any>{

    const postData :object = {
        user: {
            email: form.email,
            password: form.password
        },
    }

    return this.apiService.post('/users', postData);
  }
}
