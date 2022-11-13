import { Component } from '@angular/core';

@Component({
    selector: 'ngx-van-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    host: {
        class: 'layout',
    },
})
export class AppComponent {}
