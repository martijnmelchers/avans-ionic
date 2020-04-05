import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegisterPageRoutingModule } from './register-routing.module';

import { RegisterPage } from './register.page';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RegisterPageRoutingModule
    ],
    providers: [
        InAppBrowser,
        GooglePlus
    ],
    declarations: [
        RegisterPage
    ]
})
export class RegisterPageModule {
}
