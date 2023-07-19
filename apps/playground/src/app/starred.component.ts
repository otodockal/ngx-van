import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'ngx-van-starred',
    styles: [
        `
            img {
                width: 100%;
                max-width: 512px;
            }
        `,
    ],
    template: `
        <h1>Starred</h1>
        <img src="./assets/logo.png" />
    `,
})
export class StarredComponent {}
