import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ChangeDetectorRef, inject, Injectable, OnDestroy } from '@angular/core';
import {
    BehaviorSubject,
    catchError,
    combineLatest,
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
    private readonly _cd = inject(ChangeDetectorRef);
    private readonly _overlay = inject(Overlay);

    private _overlayRef: OverlayRef | null = null;
    private _triggerEl: HTMLElement | null = null;

    readonly onDestroy$ = new Subject<void>();
    readonly events$ = new Subject<'openLeft' | 'closeLeft' | 'openRight' | 'closeRight' | null>();
    readonly menu$ = new BehaviorSubject<'mobile' | 'desktop' | null>(null);
    readonly isOpen$ = new BehaviorSubject(false);
    readonly vm$ = combineLatest({
        isOpen: this.isOpen$,
        menu: this.menu$,
    });

    /**
     * Open nav overlay element
     */
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

        // create nav overlay
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
        this._waitForCloseEvents(this._overlayRef, type);
        // focus first focusable el
        this._focusFirstFocusableElement(this._overlayRef);

        return this._overlayRef;
    }

    /**
     * Close nav overlay element without animation (or a delay)
     */
    close() {
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._overlayRef = null;
            this._triggerEl?.focus();
            this._triggerEl = null;
        }
    }

    /**
     * Close nav overlay element with considered animation (or a delay)
     */
    scheduleClose(type: 'start' | 'end') {
        this.events$.next(type === 'start' ? 'closeLeft' : 'closeRight');
    }

    /**
     * On window resize event check if menuType is 'desktop' and remove overlay eventually
     */
    waitForDesktopAndClose(breakpoint: number | null) {
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
                        this.close();
                    }
                    this._cd.markForCheck();
                });
        } else {
            this.menu$.next('desktop');
            this._cd.markForCheck();
        }
    }

    /**
     * Schedule close on Esc click, Backdrop click
     */
    private _waitForCloseEvents(overlayRef: OverlayRef, type: 'start' | 'end') {
        // notify UI
        this.isOpen$.next(true);
        this.events$.next(type === 'end' ? 'openLeft' : 'openRight');

        merge(
            // Esc click
            overlayRef.keydownEvents().pipe(filter((e) => e.code.toLowerCase() === 'escape')),
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

    /**
     * Focus first anchor element on overlay open
     */
    private _focusFirstFocusableElement(overlayRef: OverlayRef) {
        const focusable = overlayRef.hostElement.querySelector('a');
        if (focusable) {
            focusable.focus();
        }
    }

    /**
     * Menu type based on given breakpoint size: 'mobile' or 'desktop'
     */
    private _getMenuType(breakPointSize: number) {
        return window.innerWidth <= breakPointSize ? 'mobile' : 'desktop';
    }

    ngOnDestroy() {
        this.onDestroy$.next();
    }
}
