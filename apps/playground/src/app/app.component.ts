import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { NgxVan } from 'ngx-van';
import { IconComponent } from './icon/icon.component';

@Component({
    standalone: true,
    selector: 'ngx-van-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    host: {
        class: 'layout',
    },
    imports: [NgIf, NgxVan, IconComponent],
})
export class AppComponent {}
