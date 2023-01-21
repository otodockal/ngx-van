import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-icon',
    host: {
        class: 'material-icons',
    },
    template: `
        <ng-content></ng-content>
    `,
})
export class IconComponent {}
