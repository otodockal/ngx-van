import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgxVan, NgxVanItem, NgxVanTriggerFor } from 'ngx-van';
import { IconComponent } from './icon/icon.component';

@Component({
    selector: 'ngx-van-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    host: {
        class: 'layout',
    },
    imports: [IconComponent, RouterModule, NgxVan, NgxVanItem, NgxVanTriggerFor]
})
export class AppComponent {}
