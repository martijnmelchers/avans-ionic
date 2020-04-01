import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RequestOptions } from '../../requestoptions';
import { environment } from '../../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class ApiService {

	constructor(private readonly _http: HttpClient) {
	}

	public async get<T>(url: string, parameters: any = null, requestOptions: RequestOptions = {}): Promise<T> {
		return this._http.get<T>(`${requestOptions.removeEndpoint ? '' : environment.endpoints.api}${url}`, {
			responseType: requestOptions.responseType,
			params: parameters,
			headers: new HttpHeaders(requestOptions.headers)
		}).toPromise<T>();
	}

	public async post<T>(url: string, body: object | string, parameters: any = null, requestOptions: RequestOptions = {}): Promise<T> {
		return await this._http.post<T>(`${requestOptions.removeEndpoint ? '' : environment.endpoints.api}${url}`, body, {
			responseType: requestOptions.responseType,
			params: parameters,
			headers: new HttpHeaders(requestOptions.headers)
		}).toPromise<T>();
	}

	public async put<T>(url: string, body: object | string, parameters: any = null, requestOptions: RequestOptions = {}): Promise<T> {
		return await this._http.put<T>(`${requestOptions.removeEndpoint ? '' : environment.endpoints.api}${url}`, body, {
			responseType: requestOptions.responseType,
			params: parameters,
			headers: new HttpHeaders(requestOptions.headers)
		}).toPromise<T>();
	}

	public async patch<T>(url: string, body: object | string, parameters: any = null, requestOptions: RequestOptions = {}): Promise<T> {
		return await this._http.patch<T>(`${requestOptions.removeEndpoint ? '' : environment.endpoints.api}${url}`, body, {
			responseType: requestOptions.responseType,
			params: parameters,
			headers: new HttpHeaders(requestOptions.headers)
		}).toPromise<T>();
	}

	public async delete<T>(url: string, parameters: any = null, requestOptions: RequestOptions = {}): Promise<T> {
		return await this._http.delete<T>(`${requestOptions.removeEndpoint ? '' : environment.endpoints.api}${url}`, {
			responseType: requestOptions.responseType,
			params: parameters,
			headers: new HttpHeaders(requestOptions.headers)
		}).toPromise<T>();
	}


}
