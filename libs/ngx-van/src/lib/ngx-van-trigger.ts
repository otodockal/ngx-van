import { computed, Directive, ElementRef, inject, input } from '@angular/core';
import { NgxVan } from './ngx-van';

@Directive({
    selector: '[ngxVanTrigger]',
    host: {
        '(click)': 'toggleMobileMenu()',
        '[style.display]': '!isVisibleByDevice() && !visible() ? "none" : null',
    },
})
export class NgxVanTrigger {
    private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    readonly ngxVanTrigger = input.required<NgxVan>();
    readonly visible = input(false);

    protected isVisibleByDevice = computed(() => this.ngxVanTrigger()?.vm.menu() === 'mobile');

    protected toggleMobileMenu() {
        this.ngxVanTrigger()?.toggleMobileMenu(this.el);
    }
}
