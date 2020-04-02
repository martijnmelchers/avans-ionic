import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlayerPage } from './player.page';
import { InRoomGuard } from '../core/guard/in-room.guard';

const routes: Routes = [
  {
    path: ':name',
    component: PlayerPage,
    canActivate: [InRoomGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlayerPageRoutingModule {}
