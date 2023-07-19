import { AnimationEvent } from '@angular/animations';
import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { PortalModule, TemplatePortal } from '@angular/cdk/portal';
import { AsyncPipe, NgIf } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    Input,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ngxVanAnimations } from './ngx-van-animations';
import { NgxVanService } from './ngx-van.service';

@Component({
    standalone: true,
    selector: 'ngx-van',
    exportAs: 'ngxVan',
    host: {
        ngSkipHydration: '',
    },
    animations: [ngxVanAnimations],
    template: `
        <!-- MOBILE: lazy, instatiate on demand using toggleMobileMenu() -->
        <!-- DESKTOP: content for desktop -->
        <ng-template #navContainer>
            <nav
                [style]="_voidMobileStyle"
                [@nav]="_navStates$ | async"
                (@nav.done)="_closeMobileMenuOnAnimationDone($event)"
                [cdkTrapFocus]="vm.isOpen"
            >
                <ng-content></ng-content>
            </nav>
        </ng-template>
        <!-- DESKTOP -->
        <div class="ngx-van-ssr" *ngIf="vm.menu === 'desktop'" [@.disabled]="true">
            <ng-template [cdkPortalOutlet]="_navContainerPortal"></ng-template>
        </div>
    `,
    providers: [NgxVanService],
    imports: [NgIf, AsyncPipe, A11yModule, PortalModule, OverlayModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxVan implements OnInit, AfterViewInit {
    private readonly _ngxVanService = inject(NgxVanService);
    private readonly _viewContainer = inject(ViewContainerRef);
    private readonly _isBrowser = inject(Platform).isBrowser;
    private readonly _cd = inject(ChangeDetectorRef);
    private readonly _destroyRef = inject(DestroyRef);

    @Input() side: 'start' | 'end' = 'end';
    @Input() breakpoint: number | null = 991;
    @Input() closeOnEscapeKeyClick: 'close' | 'dispose' | false = 'close';
    @Input() closeOnBackdropClick: 'close' | 'dispose' | false = 'close';

    @ViewChild('navContainer')
    private readonly _navContainerTpl: TemplateRef<HTMLElement> | null = null;

    protected readonly _navStates$ = this._ngxVanService.navStates$;
    protected _navContainerPortal: TemplatePortal<any> | null = null;

    /**
     * Void (initial) style for mobile menu (and mobile animations)
     * - needs to be set dynamically, so declared in component scope
     */
    protected get _voidMobileStyle() {
        if (this.vm.menu === 'mobile') {
            return this.side === 'end'
                ? 'position: fixed; right: 0; transform: translateX(100%)'
                : 'position: fixed; left: 0; transform: translateX(-100%)';
        }
        return null;
    }

    /**
     * Vm properties accessible in templates
     */
    vm: { isOpen: boolean; menu: 'mobile' | 'desktop' | null } = {
        isOpen: false,
        menu: !this._isBrowser ? 'desktop' : null,
    };

    ngOnInit() {
        if (this._isBrowser) {
            this._ngxVanService.waitForDesktopAndClose(this.breakpoint);
            this._ngxVanService.vm$
                .pipe(takeUntilDestroyed(this._destroyRef))
                .subscribe(({ isOpen, menu }) => {
                    this.vm = {
                        isOpen,
                        menu,
                    };
                    this._cd.markForCheck();
                });
        }
    }

    ngAfterViewInit() {
        Promise.resolve().then(() => {
            this._navContainerPortal = new TemplatePortal(
                this._navContainerTpl!,
                this._viewContainer,
            );
            this._cd.markForCheck();
        });
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu(triggerEl: HTMLElement) {
        if (this._ngxVanService.isOpen$.value) {
            this.closeMobileMenu();
        } else {
            this._ngxVanService.open(
                triggerEl,
                this._navContainerTpl!.elementRef.nativeElement,
                this._navContainerPortal!,
                this.side,
                this.closeOnEscapeKeyClick,
                this.closeOnBackdropClick,
            );
        }
    }

    /**
     * Close mobile menu with respect to animation
     */
    closeMobileMenu() {
        this._ngxVanService.close(this.side);
    }

    /**
     * Close mobile menu without animation
     */
    disposeMobileMenu() {
        this._ngxVanService.dispose();
    }

    protected _closeMobileMenuOnAnimationDone(e: AnimationEvent) {
        if (e.toState === 'closeLeft' || e.toState === 'closeRight') {
            this.disposeMobileMenu();
        }
    }
}
