/* eslint-disable @angular-eslint/no-host-metadata-property */
import { Directive, inject } from '@angular/core';
import { NgxVanComponent } from './ngx-van.component';

@Directive({
    selector: '[ngx-van-item]',
    host: {
        '(click)': 'close()',
    },
})
export class NgxVanItemDirective {
    private _ngxVaComponent = inject(NgxVanComponent);

    close() {
        this._ngxVaComponent.closeMobileMenuNow();
    }
}
