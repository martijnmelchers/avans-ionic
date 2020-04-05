import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JoinRoomComponent } from './join-room.component';

const routes: Routes = [
	{
		path: '',
		component: JoinRoomComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class JoinRoomRoutingModule {
}
