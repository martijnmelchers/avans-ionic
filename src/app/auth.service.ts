import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import jwt_decode from 'jwt-decode';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(private api: ApiService) {
    }

    public get loggedIn(): boolean {
        return localStorage.getItem('jwt') != null;
    }

    private static saveToken(user: any) {
        localStorage.setItem('jwt', user.token);
    }

    public async login(form: any): Promise<any> {


        let user: any = await this.api.post('/users/login', {
            user: {
                email: form.email,
                password: form.password
            }
        });
        user = user.user;

        AuthService.saveToken(user);
        return user;
    }

    public async register(form: any): Promise<any> {

        const postData: object = {
            user: {
                email: form.email,
                password: form.password
            }
        };
        let user: any = await this.api.post('/users', postData);
        user = user.user;
        AuthService.saveToken(user);
        return user;
    }

    public getTokenData(): object {
        const data: object = jwt_decode(this.getToken());
        return data;
    }

    public getToken() {
        return localStorage.getItem('jwt');
    }
}
