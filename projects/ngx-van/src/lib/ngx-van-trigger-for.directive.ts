import { Directive, ElementRef, Input } from '@angular/core';
import { NgxVanComponent } from './ngx-van.component';

@Directive({
    selector: '[ngxVanTriggerFor]',
    host: {
        '(click)': '_handleClick()',
        '[style.display]': '!_isVisible ? "none" : null',
    },
})
export class NgxVanTriggerForDirective {
    @Input() ngxVanTriggerFor: NgxVanComponent | null = null;

    get _isVisible() {
        return this.ngxVanTriggerFor?.menu === 'mobile';
    }

    constructor(private _elRef: ElementRef<HTMLElement>) {
        this.ngxVanTriggerFor?._events$.subscribe((e) => {
            if (e?.includes('left')) {
                this._elRef.nativeElement.focus();
            }
        });
    }

    _handleClick() {
        this.ngxVanTriggerFor?.toggleMobileMenu(this._elRef.nativeElement);
    }
}
