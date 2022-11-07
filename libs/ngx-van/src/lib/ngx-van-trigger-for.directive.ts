/* eslint-disable @angular-eslint/no-host-metadata-property */
import { Directive, ElementRef, inject, Input } from '@angular/core';
import { NgxVanComponent } from './ngx-van.component';

@Directive({
    selector: '[ngxVanTriggerFor]',
    host: {
        '(click)': '_handleClick()',
        '[style.display]': '!_isVisible ? "none" : null',
    },
})
export class NgxVanTriggerForDirective {
    private readonly _elRef: HTMLElement = inject(ElementRef).nativeElement;

    @Input() ngxVanTriggerFor: NgxVanComponent | null = null;

    get _isVisible() {
        return this.ngxVanTriggerFor?.menu === 'mobile';
    }

    constructor() {
        this.ngxVanTriggerFor?._events$.subscribe((e) => {
            if (e?.includes('left')) {
                this._elRef.focus();
            }
        });
    }

    _handleClick() {
        this.ngxVanTriggerFor?.toggleMobileMenu(this._elRef);
    }
}
