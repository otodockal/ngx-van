import { Directive, Input, inject } from '@angular/core';
import { NgxVan } from './ngx-van.component';

@Directive({
    standalone: true,
    selector: '[ngx-van-item]',
    host: {
        '(click)': 'close()',
    },
})
export class NgxVanItem {
    private readonly _ngxVaComponent = inject(NgxVan);

    @Input('ngx-van-item') ngxVanItem: 'dispose' | 'close' | '' = 'dispose';

    protected close() {
        /**
         * allow only on mobile
         */
        if (this._ngxVaComponent.menu === 'mobile') {
            if (this.ngxVanItem === 'close' || this.ngxVanItem === '') {
                this._ngxVaComponent.closeMobileMenu();
            } else {
                this._ngxVaComponent.disposeMobileMenu();
            }
        }
    }
}
