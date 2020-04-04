import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { FileChooser } from '@ionic-native/file-chooser/ngx';

@Component({
  selector: 'app-torrent-add',
  templateUrl: './torrent-add.component.html',
  styleUrls: ['./torrent-add.component.scss'],
})
export class TorrentAddComponent implements OnInit {

  constructor(private _modal: ModalController, private _file: FileChooser) { }

  ngOnInit() {}

  public async closeModal() {
    await this._modal.dismiss({
      dismissed: true
    });
  }

  public async addToQueue(form: NgForm) {

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
