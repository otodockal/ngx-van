import { Directive, inject, input } from '@angular/core';
import { NgxVan } from './ngx-van';

@Directive({
    selector: '[ngx-van-item]',
    host: {
        '(click)': 'ngxVaComponent.api.nav() === "mobile" && close()',
    },
})
export class NgxVanItem {
    readonly ngxVaComponent = inject(NgxVan);

    readonly ngxVanItem = input<'dispose' | 'close' | ''>('dispose', { alias: 'ngx-van-item' });

    protected close() {
        this.ngxVanItem() === 'dispose'
            ? this.ngxVaComponent.disposeMobileNav()
            : this.ngxVaComponent.closeMobileNav();
    }
}
