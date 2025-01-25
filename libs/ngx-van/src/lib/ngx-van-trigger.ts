import { computed, Directive, ElementRef, inject, input } from '@angular/core';
import { NgxVan } from './ngx-van';

@Directive({
    selector: '[ngxVanTrigger]',
    host: {
        '(click)': 'ngxVanTrigger()?.toggleMobileNav(el)',
        '[style.display]': 'display()',
    },
})
export class NgxVanTrigger {
    protected readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    readonly ngxVanTrigger = input.required<NgxVan>();
    readonly visible = input(false);

    protected readonly display = computed(() =>
        this.ngxVanTrigger()?.api.nav() !== 'mobile' && !this.visible() ? 'none' : null,
    );
}
