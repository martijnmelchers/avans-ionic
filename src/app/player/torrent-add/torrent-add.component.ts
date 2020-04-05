import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Room } from '../../core/models/room';

@Component({
	selector: 'app-torrent-add',
	templateUrl: './torrent-add.component.html',
	styleUrls: ['./torrent-add.component.scss']
})
export class TorrentAddComponent implements OnInit {
	@Input() public room: Room;
	public results: any[] = [];
	public selectedTMDb = '';

	constructor(private _modal: ModalController, private _api: ApiService, private _alert: AlertController, private _toast: ToastController) {
	}

	ngOnInit() {
	}

	public async closeModal() {
		await this._modal.dismiss({
			dismissed: true
		});
	}

	public async addToQueue(form: NgForm) {
		console.log(form.controls.MagnetUri.value);
		console.log(this.selectedTMDb);
		if (this.selectedTMDb === '' || !form.valid) {
			const iAlert = await this._alert.create({
				header: 'Please correct the form!',
				subHeader: 'Select an item from the search list and enter a valid magnet URI',
				buttons: ['OK']
			});

			await iAlert.present();
		} else {
			try {
				await this._api.post(`rooms/${encodeURIComponent(this.room.Id)}/queue`, {
					MagnetUri: form.controls.MagnetUri.value,
					tmdbId: this.selectedTMDb
				});

				const sMsg = await this._toast.create({
					message: `Added to queue!`,
					duration: 1500,
					position: 'top',
					color: 'success'
				});

				await sMsg.present();

				this.closeModal();
			} catch (e) {
				const eMsg = await this._toast.create({
					message: `Invalid magnet URI!`,
					duration: 1500,
					position: 'top',
					color: 'danger'
				});

				await eMsg.present();
			}
		}


	}

	public async searchTMDb(form: NgForm) {
		const apiResult = await this._api.get<any>(`tmdb/${form.controls.SearchQuery.value}`);
		this.results = apiResult.results;
	}

	getReleaseYear(releaseDate: string) {
		const date = new Date(releaseDate);
		return date.getFullYear();
	}

	selectMovie($event) {
		this.selectedTMDb = $event.detail.value;
	}
}
