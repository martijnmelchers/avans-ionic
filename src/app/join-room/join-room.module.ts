import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JoinRoomComponent } from './join-room.component';
import { IonicModule } from '@ionic/angular';
import { JoinRoomRoutingModule } from './join-room-routing.module';


@NgModule({
	declarations: [JoinRoomComponent],
	imports: [
		CommonModule,
		IonicModule,
		JoinRoomRoutingModule
	]
})
export class JoinRoomModule {
}
