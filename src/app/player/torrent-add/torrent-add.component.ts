import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { ApiService } from '../../core/services/api.service';
import { Room } from '../../core/models/room';

@Component({
  selector: 'app-torrent-add',
  templateUrl: './torrent-add.component.html',
  styleUrls: ['./torrent-add.component.scss'],
})
export class TorrentAddComponent implements OnInit {
  @Input() public room: Room;

  constructor(private _modal: ModalController, private _file: FileChooser,
              private _api: ApiService) { }

  ngOnInit() {}

  public async closeModal() {
    await this._modal.dismiss({
      dismissed: true
    });
  }

  public async addToQueue(form: NgForm) {
    await this._api.post(`rooms/${encodeURIComponent(this.room.Id)}/queue`, form.value);
  }

  public async selectFile() {
    await this._file.open();
  }

  onEnter(event: KeyboardEvent, form: NgForm) {
    if (event.key === 'Enter') {
      this.addToQueue(form);
    }
  }

}
