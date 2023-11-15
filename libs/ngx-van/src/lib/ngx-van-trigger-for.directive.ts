import { computed, Directive, ElementRef, inject, Input } from '@angular/core';
import { NgxVan } from './ngx-van.component';

@Directive({
    standalone: true,
    selector: '[ngxVanTriggerFor]',
    host: {
        '(click)': '_toggleMobileMenu()',
        '[style.display]': '!_isVisibleByDevice() && !visible ? "none" : null',
    },
})
export class NgxVanTriggerFor {
    private readonly _el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    @Input() ngxVanTriggerFor: NgxVan | null = null;
    @Input() visible = false;

    protected _isVisibleByDevice = computed(() => this.ngxVanTriggerFor?.vm().menu === 'mobile');

    protected _toggleMobileMenu() {
        this.ngxVanTriggerFor?.toggleMobileMenu(this._el);
    }
}
