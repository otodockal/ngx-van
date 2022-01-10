import { Directive } from '@angular/core';
import { NgxVanComponent } from './ngx-van.component';

@Directive({
    selector: '[ngx-van-item]',
    host: {
        '(click)': 'close()',
    },
})
export class NgxVanItemDirective {
    constructor(private _ngxVaComponent: NgxVanComponent) {}
    close() {
        this._ngxVaComponent.closeMobileMenuNow();
    }
}
