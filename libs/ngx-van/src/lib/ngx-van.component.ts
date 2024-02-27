import { AnimationEvent } from '@angular/animations';
import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { PortalModule, TemplatePortal } from '@angular/cdk/portal';
import { AsyncPipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    TemplateRef,
    ViewContainerRef,
    computed,
    inject,
    input,
    untracked,
    viewChild,
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
                [style]="voidMobileStyle()"
                [cdkTrapFocus]="vm().isOpen"
                [@nav]="navStates$ | async"
                (@nav.done)="closeMobileMenuOnAnimationDone($event)"
            >
                <ng-content></ng-content>
            </nav>
        </ng-template>
        <!-- DESKTOP -->
        @if (vm().menu === 'desktop') {
            <div class="ngx-van-ssr" [@.disabled]="true">
                <ng-template [cdkPortalOutlet]="navContainerPortal()"></ng-template>
            </div>
        }
    `,
    providers: [NgxVanService],
    imports: [AsyncPipe, A11yModule, PortalModule, OverlayModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxVan implements OnInit {
    private readonly ngxVanService = inject(NgxVanService);
    private readonly viewContainer = inject(ViewContainerRef);
    private readonly isBrowser = inject(Platform).isBrowser;

    side = input<'start' | 'end'>('end');
    breakpoint = input<number | null>(991);
    closeOnEscapeKeyClick = input<'close' | 'dispose' | false>('close');
    closeOnBackdropClick = input<'close' | 'dispose' | false>('close');

    private readonly navContainerTpl = viewChild.required<TemplateRef<HTMLElement>>('navContainer');

    protected navContainerPortal = computed(
        () => new TemplatePortal(this.navContainerTpl(), this.viewContainer),
    );

    /**
     * Void (initial) style for mobile menu (and mobile animations)
     * - needs to be set dynamically, so declared in component scope
     */
    protected voidMobileStyle = computed(() => {
        if (this.vm().menu === 'mobile') {
            return untracked(this.side) === 'end'
                ? 'position: fixed; right: 0; transform: translateX(100%)'
                : 'position: fixed; left: 0; transform: translateX(-100%)';
        }
        return null;
    });

    /**
     * Nav states - for animations only
     */
    protected readonly navStates$ = this.ngxVanService.navStates$;

    /**
     * Vm properties accessible in templates
     */
    vm = this.ngxVanService.vm;

    ngOnInit() {
        if (this.isBrowser) {
            this.ngxVanService.waitForDesktopAndClose(this.breakpoint());
        }
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu(triggerEl: HTMLElement) {
        if (this.ngxVanService.isOpen()) {
            this.closeMobileMenu();
        } else {
            this.ngxVanService.open(
                triggerEl,
                this.navContainerTpl().elementRef.nativeElement,
                this.navContainerPortal(),
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
        this.ngxVanService.close(this.side());
    }

    /**
     * Close mobile menu without animation
     */
    disposeMobileMenu() {
        this.ngxVanService.dispose();
    }

    protected closeMobileMenuOnAnimationDone(e: AnimationEvent) {
        if (e.toState === 'closeLeft' || e.toState === 'closeRight') {
            this.disposeMobileMenu();
        }
    }
}
