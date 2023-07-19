import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'ngx-van-important',
    styles: [
        `
            img {
                width: 100%;
                max-width: 512px;
            }
        `,
    ],
    template: `
        <h1>Important</h1>
        <img src="./assets/logo.png" />
    `,
})
export class ImportantComponent {}
