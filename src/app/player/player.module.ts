import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlayerPageRoutingModule } from './player-routing.module';

import { PlayerPage } from './player.page';
import { TorrentServiceService } from '../torrent-service.service';
import { SocketService } from '../socket.service';
import { RoomService } from '../room.service';
import { RoomComponent } from '../room/room.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        PlayerPageRoutingModule
    ],
    declarations: [PlayerPage, RoomComponent],
    providers: [
        TorrentServiceService,
        SocketService,
        RoomService
    ]
})
export class PlayerPageModule {
}
