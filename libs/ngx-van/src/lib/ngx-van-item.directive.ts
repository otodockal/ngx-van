import { Directive, inject } from '@angular/core';
import { NgxVanComponent } from './ngx-van.component';

@Directive({
    standalone: true,
    selector: '[ngx-van-item]',
    host: {
        '(click)': 'close()',
    },
})
export class NgxVanItemDirective {
    private readonly _ngxVaComponent = inject(NgxVanComponent);

    protected close() {
        this._ngxVaComponent.closeMobileMenuNow();
    }
}
