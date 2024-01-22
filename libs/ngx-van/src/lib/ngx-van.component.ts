import { AnimationEvent } from '@angular/animations';
import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { PortalModule, TemplatePortal } from '@angular/cdk/portal';
import { AsyncPipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    afterNextRender,
    computed,
    inject,
    input,
    untracked,
} from '@angular/core';
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
                [style]="_voidMobileStyle()"
                [@nav]="_navStates$ | async"
                (@nav.done)="_closeMobileMenuOnAnimationDone($event)"
                [cdkTrapFocus]="vm().isOpen"
            >
                <ng-content></ng-content>
            </nav>
        </ng-template>
        <!-- DESKTOP -->
        @if (vm().menu === 'desktop') {
            <div class="ngx-van-ssr" [@.disabled]="true">
                <ng-template [cdkPortalOutlet]="_navContainerPortal"></ng-template>
            </div>
        }
    `,
    providers: [NgxVanService],
    imports: [AsyncPipe, A11yModule, PortalModule, OverlayModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxVan implements OnInit {
    private readonly _ngxVanService = inject(NgxVanService);
    private readonly _viewContainer = inject(ViewContainerRef);
    private readonly _isBrowser = inject(Platform).isBrowser;
    private readonly _cd = inject(ChangeDetectorRef);

    side = input<'start' | 'end'>('end');
    breakpoint = input<number | null>(991);
    closeOnEscapeKeyClick = input<'close' | 'dispose' | false>('close');
    closeOnBackdropClick = input<'close' | 'dispose' | false>('close');

    /**
     * Void (initial) style for mobile menu (and mobile animations)
     * - needs to be set dynamically, so declared in component scope
     */
    protected _voidMobileStyle = computed(() => {
        if (this.vm().menu === 'mobile') {
            return untracked(this.side) === 'end'
                ? 'position: fixed; right: 0; transform: translateX(100%)'
                : 'position: fixed; left: 0; transform: translateX(-100%)';
        }
        return null;
    });

    @ViewChild('navContainer')
    private readonly _navContainerTpl: TemplateRef<HTMLElement> | null = null;

    protected readonly _navStates$ = this._ngxVanService.navStates$;

    protected _navContainerPortal: TemplatePortal<any> | null = null;

    /**
     * Vm properties accessible in templates
     */
    vm = this._ngxVanService.vm;

    constructor() {
        afterNextRender(() => {
            this._navContainerPortal = new TemplatePortal(
                this._navContainerTpl!,
                this._viewContainer,
            );
            this._cd.markForCheck();
        });
    }

    ngOnInit() {
        if (this._isBrowser) {
            this._ngxVanService.waitForDesktopAndClose(this.breakpoint());
        }
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu(triggerEl: HTMLElement) {
        if (this._ngxVanService.isOpen()) {
            this.closeMobileMenu();
        } else {
            this._ngxVanService.open(
                triggerEl,
                this._navContainerTpl!.elementRef.nativeElement,
                this._navContainerPortal!,
                this.side(),
                this.closeOnEscapeKeyClick(),
                this.closeOnBackdropClick(),
            );
        }
    }

    /**
     * Close mobile menu with respect to animation
     */
    closeMobileMenu() {
        this._ngxVanService.close(this.side());
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
