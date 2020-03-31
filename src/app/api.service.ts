import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RequestOptions } from './requestoptions';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    static url = 'http://localhost:5000';

    constructor(private readonly http: HttpClient) {
    }

    public async get<T>(endpoint: string, parameters: any = null, options: RequestOptions): Promise<T> {
        const builtUrl = `${ApiService.url}/${endpoint}`;
        return this.http.get<T>(builtUrl, {
            responseType: options.responseType,
            params: parameters,
            headers: new HttpHeaders(options.headers)
        }).toPromise<T>();
    }

    public async post<T>(endpoint: string, body: object | string, parameters: any = null, options: RequestOptions = {}): Promise<T> {
        const builtUrl = `${ApiService.url}${endpoint}`;
        return await this.http.post<T>(builtUrl, body, {
            responseType: options.responseType,
            params: parameters,
            headers: new HttpHeaders(options.headers)
        }).toPromise<T>();
    }
}
