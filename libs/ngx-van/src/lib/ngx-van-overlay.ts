import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { TemplatePortal } from '@angular/cdk/portal';
import { ChangeDetectorRef, DestroyRef, Injectable, NgZone, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, first, fromEvent, map, race, startWith, tap } from 'rxjs';
import {
    CloseOnBackdropClick,
    CloseOnEscapeKeyClick,
    MenuSide,
    MenuType,
    NavState,
} from './ngx-van';

@Injectable()
export class NgxVanOverlay {
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
        // create nav overlay
        this.overlayRef = this.overlay.create({
            hasBackdrop: true,
            backdropClass: 'ngx-van-mobile-backdrop',
            panelClass: 'ngx-van-mobile',
            positionStrategy: this.overlay
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
                .withFlexibleDimensions(false),
            scrollStrategy: this.overlay.scrollStrategies.block(),
            disposeOnNavigation: true,
        });
        this.overlayRef.attach(portal);

        // bind closing events
        this.onCloseEvents(this.overlayRef, side, closeOnEscapeKeyClick, closeOnBackdropClick);
        // focus first focusable el
        this.focusFirstFocusableElement(this.overlayRef);

        return this.overlayRef;
    }

    /**
     * Close nav overlay element without animation
     */
    dispose(side: MenuSide) {
        if (this.overlayRef) {
            this.overlayRef.dispose();
            this.overlayRef = null;
            this.triggerEl?.focus();
            this.triggerEl = null;
            this.close(side); // no animation, but it gets navState to default state
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
    onResize(side: MenuSide, breakpoint: number | null) {
        if (breakpoint === null) {
            return this.menu.set('desktop');
        }
        return this.ngZone.runOutsideAngular(() =>
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
                            this.dispose(side);
                            this.navState.set(null);
                        }
                    });
                }),
        );
    }

    /**
     * Schedule close on Esc click, Backdrop click
     */
    private onCloseEvents(
        overlayRef: OverlayRef,
        side: MenuSide,
        closeOnEscapeKeyClick: CloseOnEscapeKeyClick,
        closeOnBackdropClick: CloseOnBackdropClick,
    ) {
        // notify UI
        this.isOpen.set(true);
        this.navState.set(this.getNavOpenState(side));

        const events = [];

        if (closeOnEscapeKeyClick !== false) {
            events.push(
                overlayRef.keydownEvents().pipe(
                    first((e) => e.code.toLowerCase() === 'escape'),
                    tap(() => {
                        this[closeOnEscapeKeyClick](side);
                        this.cd.markForCheck();
                    }),
                ),
            );
        }

        if (closeOnBackdropClick !== false) {
            events.push(
                overlayRef.backdropClick().pipe(
                    first(),
                    tap(() => {
                        this[closeOnBackdropClick](side);
                        this.cd.markForCheck();
                    }),
                ),
            );
        }

        race(events).subscribe();

        // null overlayRef on every time is an element detached
        overlayRef
            .detachments()
            .pipe(first())
            .subscribe(() => {
                this.overlayRef = null;
                this.isOpen.set(false);
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
