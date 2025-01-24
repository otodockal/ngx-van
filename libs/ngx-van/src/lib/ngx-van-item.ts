import { Directive, inject, input } from '@angular/core';
import { NgxVan } from './ngx-van';

@Directive({
    selector: '[ngx-van-item]',
    host: {
        '(click)': 'close()',
    },
})
export class NgxVanItem {
    private readonly ngxVaComponent = inject(NgxVan);

    readonly ngxVanItem = input<'dispose' | 'close' | ''>('dispose', { alias: 'ngx-van-item' });

    protected close() {
        if (this.ngxVaComponent.api.nav() !== 'mobile') {
            return;
        }
        if (this.ngxVanItem() === 'close' || this.ngxVanItem() === '') {
            this.ngxVaComponent.closeMobileNav();
        } else {
            this.ngxVaComponent.disposeMobileNav();
        }
    }
}
