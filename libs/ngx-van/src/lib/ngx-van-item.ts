import { Directive, inject, input } from '@angular/core';
import { NgxVan } from './ngx-van';

@Directive({
    selector: '[ngx-van-item]',
    host: {
        '(click)': 'ngxVan.api.nav() === "mobile" && close()',
    },
})
export class NgxVanItem {
    protected readonly ngxVan = inject(NgxVan);

    readonly ngxVanItem = input<'dispose' | 'close' | ''>('dispose', { alias: 'ngx-van-item' });

    protected close() {
        this.ngxVanItem() === 'dispose'
            ? this.ngxVan.disposeMobileNav()
            : this.ngxVan.closeMobileNav();
    }
}
