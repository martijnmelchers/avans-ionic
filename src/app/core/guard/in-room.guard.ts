import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { ApiService } from '../services/api.service';

@Injectable({
	providedIn: 'root'
})
export class InRoomGuard implements CanActivate {

	constructor(private _api: ApiService, private _router: Router) {
	}

	async canActivate(
		next: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): Promise<boolean | UrlTree> {
		try {
			const roomId = next.paramMap.get('name');
			console.log(roomId);
			await this._api.get(`rooms/${encodeURIComponent(roomId)}`);
			return true;
		} catch(e) {
		    return this._router.navigate(['/tabs/rooms']);
        }
	}
}
