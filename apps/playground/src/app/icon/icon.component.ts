/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable @angular-eslint/no-host-metadata-property */
import { Component } from '@angular/core';

@Component({
    selector: 'app-icon',
    standalone: true,
    host: {
        class: 'material-icons',
    },
    template: `<ng-content></ng-content>`,
})
export class IconComponent {}
