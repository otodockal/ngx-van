import { Directive, inject, input } from '@angular/core';
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

    ngxVanItem = input<'dispose' | 'close' | ''>('dispose', { alias: 'ngx-van-item' });

    protected close() {
        /**
         * allow only on mobile
         */
        if (this._ngxVaComponent.vm().menu === 'mobile') {
            if (this.ngxVanItem() === 'close' || this.ngxVanItem() === '') {
                this._ngxVaComponent.closeMobileMenu();
            } else {
                this._ngxVaComponent.disposeMobileMenu();
            }
        }
    }
}
