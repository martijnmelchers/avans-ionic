import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlayerPage } from './player.page';
import { InRoomGuard } from '../core/guard/in-room.guard';
import { UserDetailComponent } from './user-detail/user-detail.component';

const routes: Routes = [
  {
    path: ':name',
    component: PlayerPage,
    canActivate: [InRoomGuard]
  },
  {
    path: ':name/:email',
    component: UserDetailComponent,
    canActivate: [InRoomGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlayerPageRoutingModule {}
