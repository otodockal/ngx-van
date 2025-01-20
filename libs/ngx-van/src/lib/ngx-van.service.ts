import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { TemplatePortal } from '@angular/cdk/portal';
import { ChangeDetectorRef, DestroyRef, Injectable, NgZone, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, first, fromEvent, map, race, startWith } from 'rxjs';
import {
    CloseOnBackdropClick,
    CloseOnEscapeKeyClick,
    MenuSide,
    MenuType,
    NavState,
} from './ngx-van';

@Injectable()
export class NgxVanService {
    private readonly cd = inject(ChangeDetectorRef);
    private readonly overlay = inject(Overlay);
    private readonly destroyRef = inject(DestroyRef);
    private readonly ngZone = inject(NgZone);
    private readonly isBrowser = inject(Platform).isBrowser;

    private overlayRef: OverlayRef | null = null;
    private triggerEl: HTMLElement | null = null;

    readonly navState = signal<NavState>(null);
    readonly menu = signal<MenuType>(this.isBrowser ? null : 'desktop');
    readonly isOpen = signal(false);

    /**
     * Open nav overlay element
     */
    open(
        triggerEl: HTMLElement,
        target: Element,
        portal: TemplatePortal<any>,
        side: MenuSide,
        closeOnEscapeKeyClick: CloseOnEscapeKeyClick,
        closeOnBackdropClick: CloseOnBackdropClick,
    ) {
        this.triggerEl = triggerEl;
        const positionStrategy = this.overlay
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
        this.overlayRef = this.overlay.create({
            hasBackdrop: true,
            backdropClass: 'ngx-van-mobile-backdrop',
            panelClass: 'ngx-van-mobile',
            positionStrategy,
            scrollStrategy: this.overlay.scrollStrategies.block(),
            disposeOnNavigation: true,
        });
        this.overlayRef.attach(portal);

        // bind closing events
        this.waitForCloseEvents(this.overlayRef, side, closeOnEscapeKeyClick, closeOnBackdropClick);
        // focus first focusable el
        this.focusFirstFocusableElement(this.overlayRef);

        return this.overlayRef;
    }

    /**
     * Close nav overlay element without animation
     */
    dispose() {
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null;
            this.triggerEl?.focus();
            this.triggerEl = null;
        }
    }

    /**
     * Close nav overlay element with respect to animation
     */
    close(side: MenuSide) {
        this.navState.set(this.getNavCloseState(side));
    }

    /**
     * On window resize event check if menuType is 'desktop' and remove overlay eventually
     */
    waitForDesktopAndClose(breakpoint: number | null) {
        if (breakpoint !== null) {
            this.ngZone.runOutsideAngular(() => {
                fromEvent(window, 'resize')
                    .pipe(
                        startWith(this.getMenuType(breakpoint)),
                        map(() => this.getMenuType(breakpoint)),
                        distinctUntilChanged(),
                        takeUntilDestroyed(this.destroyRef),
                    )
                    .subscribe((menuType) => {
                        this.ngZone.run(() => {
                            this.menu.set(menuType);
                            // clear animation state
                            if (menuType === 'desktop') {
                                this.navState.set(null);
                                this.dispose();
                            }
                            this.cd.markForCheck();
                        });
                    });
            });
        } else {
            this.menu.set('desktop');
            this.cd.markForCheck();
        }
    }

    /**
     * Schedule close on Esc click, Backdrop click
     */
    private waitForCloseEvents(
        overlayRef: OverlayRef,
        side: MenuSide,
        closeOnEscapeKeyClick: CloseOnEscapeKeyClick,
        closeOnBackdropClick: CloseOnBackdropClick,
    ) {
        // notify UI
        this.isOpen.set(true);
        this.navState.set(this.getNavOpenState(side));

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
            this.cd.markForCheck();
        });

        // null overalyRef on every time is an element detached
        overlayRef
            .detachments()
            .pipe(first())
            .subscribe(() => {
                this.isOpen.set(false);
                this.overlayRef = null;
                this.cd.markForCheck();
            });
    }

    /**
     * Focus first anchor element on overlay open
     */
    private focusFirstFocusableElement(overlayRef: OverlayRef) {
        const focusable = overlayRef.hostElement.querySelector('a');
        if (focusable) {
            focusable.focus();
        }
    }

    /**
     * Menu type based on given breakpoint size: 'mobile' or 'desktop'
     */
    private getMenuType(breakPointSize: number) {
        return window.innerWidth <= breakPointSize ? 'mobile' : 'desktop';
    }

    /**
     * Get animation close state based on side type
     */
    private getNavCloseState(side: MenuSide) {
        return side === 'start' ? 'closeLeft' : 'closeRight';
    }

    /**
     * Get animation open state based on side type
     */
    private getNavOpenState(side: MenuSide) {
        return side === 'end' ? 'openLeft' : 'openRight';
    }
}
