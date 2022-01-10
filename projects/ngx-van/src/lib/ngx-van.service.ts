import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ChangeDetectorRef, Injectable, OnDestroy } from '@angular/core';
import {
    BehaviorSubject,
    catchError,
    distinctUntilChanged,
    EMPTY,
    filter,
    first,
    fromEvent,
    map,
    merge,
    startWith,
    Subject,
    takeUntil,
} from 'rxjs';

@Injectable()
export class NgxVanService implements OnDestroy {
    private _overlayRef: OverlayRef | null = null;
    private _triggerEl: HTMLElement | null = null;

    readonly onDestroy$ = new Subject<void>();
    readonly events$ = new Subject<'openLeft' | 'closeLeft' | 'openRight' | 'closeRight' | null>();
    readonly menu$ = new BehaviorSubject<'mobile' | 'desktop' | null>(null);
    readonly isOpen$ = new BehaviorSubject(false);

    constructor(private _cd: ChangeDetectorRef, private _overlay: Overlay) {}

    open(
        triggerEl: HTMLElement,
        target: Element,
        navContainerPortal: TemplatePortal<any>,
        type: 'start' | 'end',
    ) {
        this._triggerEl = triggerEl;
        const positionStrategy = this._overlay
            .position()
            .flexibleConnectedTo(target)
            .withPositions([
                {
                    overlayX: 'start',
                    overlayY: 'top',
                    originX: 'start',
                    originY: 'bottom',
                },
            ])
            .withPush(false)
            .withFlexibleDimensions(false);

        this._overlayRef = this._overlay.create({
            hasBackdrop: true,
            backdropClass: 'ngx-van-mobile-backdrop',
            panelClass: 'ngx-van-mobile',
            positionStrategy,
            scrollStrategy: this._overlay.scrollStrategies.block(),
            disposeOnNavigation: true,
        });

        this._overlayRef.attach(navContainerPortal);
        // bind closing events
        this._bindEvents(triggerEl, this._overlayRef, type);
        // focus first focusable el
        this._focusFirstFocusableElement(this._overlayRef);
        return this._overlayRef;
    }

    dispose() {
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._overlayRef = null;
            this._triggerEl?.focus();
            this._triggerEl = null;
        }
    }

    scheduleClose(type: 'start' | 'end') {
        this.events$.next(type === 'start' ? 'closeLeft' : 'closeRight');
    }

    listenOnResize(breakpoint: number | null) {
        if (breakpoint !== null) {
            fromEvent(window, 'resize')
                .pipe(
                    startWith(this._getMenuType(breakpoint)),
                    map(() => this._getMenuType(breakpoint)),
                    distinctUntilChanged(),
                    takeUntil(this.onDestroy$),
                )
                .subscribe((menuType) => {
                    this.menu$.next(menuType);
                    // clear animation state
                    if (menuType === 'desktop') {
                        this.events$.next(null);
                        this.dispose();
                    }
                    this._cd.markForCheck();
                });
        } else {
            this.menu$.next('desktop');
            this._cd.markForCheck();
        }
    }

    /**
     * Dynamically bind events
     */
    private _bindEvents(triggerEl: HTMLElement, overlayRef: OverlayRef, type: 'start' | 'end') {
        // notify UI
        this.isOpen$.next(true);
        this.events$.next(type === 'end' ? 'openLeft' : 'openRight');

        merge(
            // Esc click
            overlayRef.keydownEvents().pipe(filter((e) => e.keyCode === 27)),
            // Backdrop click
            overlayRef.backdropClick(),
        )
            .pipe(
                first(),
                catchError(() => EMPTY),
            )
            .subscribe((_) => {
                this.scheduleClose(type);
                this._cd.markForCheck();
            });

        // null overalyRef on every time is an element detached
        overlayRef
            .detachments()
            .pipe(first())
            .subscribe(() => {
                this.isOpen$.next(false);
                this._overlayRef = null;
                this._cd.markForCheck();
            });
    }

    private _focusFirstFocusableElement(overlayRef: OverlayRef) {
        const focusable = overlayRef.hostElement.querySelector('a');
        if (focusable) {
            focusable.focus();
        }
    }

    private _getMenuType(breakPointSize: number) {
        return window.innerWidth <= breakPointSize ? 'mobile' : 'desktop';
    }

    ngOnDestroy() {
        this.onDestroy$.next();
    }
}
