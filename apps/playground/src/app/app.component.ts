import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { NgxVan, NgxVanItem, NgxVanTriggerFor } from 'ngx-van';
import { IconComponent } from './icon/icon.component';
import { RouterModule } from '@angular/router';

@Component({
    standalone: true,
    selector: 'ngx-van-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    host: {
        class: 'layout',
    },
    imports: [NgIf, IconComponent, RouterModule, NgxVan, NgxVanItem, NgxVanTriggerFor],
})
export class AppComponent {}
