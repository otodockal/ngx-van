import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { TemplatePortal } from '@angular/cdk/portal';
import {
    ChangeDetectorRef,
    DestroyRef,
    Injectable,
    NgZone,
    computed,
    inject,
    signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, distinctUntilChanged, first, fromEvent, map, race, startWith } from 'rxjs';

@Injectable()
export class NgxVanService {
    private readonly _cd = inject(ChangeDetectorRef);
    private readonly _overlay = inject(Overlay);
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _ngZone = inject(NgZone);
    private readonly _isBrowser = inject(Platform).isBrowser;

    private _overlayRef: OverlayRef | null = null;
    private _triggerEl: HTMLElement | null = null;

    readonly navStates$ = new Subject<
        'openLeft' | 'closeLeft' | 'openRight' | 'closeRight' | null
    >();

    readonly menu = signal<'mobile' | 'desktop' | null>(null);
    readonly isOpen = signal(false);
    readonly vm = computed(() => ({
        isOpen: this.isOpen(),
        menu: !this._isBrowser ? 'desktop' : this.menu(),
    }));

    /**
     * Open nav overlay element
     */
    open(
        triggerEl: HTMLElement,
        target: Element,
        navContainerPortal: TemplatePortal<any>,
        type: 'start' | 'end',
        closeOnEscapeKeyClick: 'close' | 'dispose' | false,
        closeOnBackdropClick: 'close' | 'dispose' | false,
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
        this._waitForCloseEvents(
            this._overlayRef,
            type,
            closeOnEscapeKeyClick,
            closeOnBackdropClick,
        );
        // focus first focusable el
        this._focusFirstFocusableElement(this._overlayRef);

        return this._overlayRef;
    }

    /**
     * Close nav overlay element without animation
     */
    dispose() {
        if (this._overlayRef) {
            this._overlayRef.dispose();
            this._overlayRef = null;
            this._triggerEl?.focus();
            this._triggerEl = null;
        }
    }

    /**
     * Close nav overlay element with respect to animation
     */
    close(side: 'start' | 'end') {
        this.navStates$.next(this._getNavCloseState(side));
    }

    /**
     * On window resize event check if menuType is 'desktop' and remove overlay eventually
     */
    waitForDesktopAndClose(breakpoint: number | null) {
        if (breakpoint !== null) {
            this._ngZone.runOutsideAngular(() => {
                fromEvent(window, 'resize')
                    .pipe(
                        startWith(this._getMenuType(breakpoint)),
                        map(() => this._getMenuType(breakpoint)),
                        distinctUntilChanged(),
                        takeUntilDestroyed(this._destroyRef),
                    )
                    .subscribe((menuType) => {
                        this._ngZone.run(() => {
                            this.menu.set(menuType);
                            // clear animation state
                            if (menuType === 'desktop') {
                                this.navStates$.next(null);
                                this.dispose();
                            }
                            this._cd.markForCheck();
                        });
                    });
            });
        } else {
            this.menu.set('desktop');
            this._cd.markForCheck();
        }
    }

    /**
     * Schedule close on Esc click, Backdrop click
     */
    private _waitForCloseEvents(
        overlayRef: OverlayRef,
        side: 'start' | 'end',
        closeOnEscapeKeyClick: 'close' | 'dispose' | false,
        closeOnBackdropClick: 'close' | 'dispose' | false,
    ) {
        // notify UI
        this.isOpen.set(true);
        this.navStates$.next(this._getNavOpenState(side));

        const raceEvents = [];

        // Esc click
        if (closeOnEscapeKeyClick !== false) {
            raceEvents.push(
                overlayRef.keydownEvents().pipe(
                    first((e) => e.code.toLowerCase() === 'escape'),
                    map(() => 'ESC_KEY_CLICK' as const),
                ),
            );
        }

        // Backdrop click
        if (closeOnBackdropClick !== false) {
            raceEvents.push(
                overlayRef.backdropClick().pipe(
                    first(),
                    map(() => 'BACKDROP_CLICK' as const),
                ),
            );
        }

        race(raceEvents).subscribe((e) => {
            if (e === 'ESC_KEY_CLICK') {
                if (closeOnEscapeKeyClick === 'close') {
                    this.close(side);
                } else if (closeOnEscapeKeyClick === 'dispose') {
                    this.dispose();
                }
            } else if (e === 'BACKDROP_CLICK') {
                if (closeOnBackdropClick === 'close') {
                    this.close(side);
                } else if (closeOnBackdropClick === 'dispose') {
                    this.dispose();
                }
            }
            this._cd.markForCheck();
        });

        // null overalyRef on every time is an element detached
        overlayRef
            .detachments()
            .pipe(first())
            .subscribe(() => {
                this.isOpen.set(false);
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

    /**
     * Get animation close state based on side type
     */
    private _getNavCloseState(side: 'start' | 'end') {
        return side === 'start' ? 'closeLeft' : 'closeRight';
    }

    /**
     * Get animation open state based on side type
     */
    private _getNavOpenState(side: 'start' | 'end') {
        return side === 'end' ? 'openLeft' : 'openRight';
    }
}
