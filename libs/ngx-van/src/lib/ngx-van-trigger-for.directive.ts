/* eslint-disable @angular-eslint/no-host-metadata-property */
import { Directive, ElementRef, inject, Input } from '@angular/core';
import { NgxVanComponent } from './ngx-van.component';

@Directive({
    selector: '[ngxVanTriggerFor]',
    host: {
        '(click)': '_handleClick()',
        '[style.display]': '!_isVisible && !visible ? "none" : null',
    },
})
export class NgxVanTriggerForDirective {
    private readonly _el: HTMLElement = inject(ElementRef).nativeElement;

    @Input() ngxVanTriggerFor: NgxVanComponent | null = null;
    @Input() visible = false;

    protected get _isVisible() {
        return this.ngxVanTriggerFor?.menu === 'mobile';
    }

    protected _handleClick() {
        this.ngxVanTriggerFor?.toggleMobileMenu(this._el);
    }
}
