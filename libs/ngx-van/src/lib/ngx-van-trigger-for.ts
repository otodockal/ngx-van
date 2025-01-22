import { computed, Directive, ElementRef, inject, input } from '@angular/core';
import { NgxVan } from './ngx-van';

@Directive({
    selector: '[ngxVanTriggerFor]',
    host: {
        '(click)': 'toggleMobileMenu()',
        '[style.display]': '!isVisibleByDevice() && !visible() ? "none" : null',
    },
})
export class NgxVanTriggerFor {
    private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    readonly ngxVanTriggerFor = input.required<NgxVan>();
    readonly visible = input(false);

    protected isVisibleByDevice = computed(() => this.ngxVanTriggerFor()?.vm.menu() === 'mobile');

    protected toggleMobileMenu() {
        this.ngxVanTriggerFor()?.toggleMobileMenu(this.el);
    }
}
