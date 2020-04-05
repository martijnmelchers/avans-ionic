import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlayerPageRoutingModule } from './player-routing.module';

import { PlayerPage } from './player.page';
import { SocketService } from '../core/services/socket.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { TorrentDetailComponent } from './torrent-detail/torrent-detail.component';
import { TorrentAddComponent } from './torrent-add/torrent-add.component';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { InviteUserComponent } from './invite-user/invite-user.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		IonicModule,
		PlayerPageRoutingModule
	],
	declarations: [
		PlayerPage,
		UserDetailComponent,
		TorrentDetailComponent,
		TorrentAddComponent,
		InviteUserComponent
	],
	providers: [
		SocketService,
		ScreenOrientation,
		FileChooser
	]
})
export class PlayerPageModule {
}
