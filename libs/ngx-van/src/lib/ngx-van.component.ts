import { AnimationEvent } from '@angular/animations';
import { A11yModule } from '@angular/cdk/a11y';
import { Platform } from '@angular/cdk/platform';
import { TemplatePortal } from '@angular/cdk/portal';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
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
    animations: [ngxVanAnimations],
    template: `
        <!-- CONTENT FOR DESKTOP/MOBILE NAV -->
        <ng-template #navContent>
            <ng-content></ng-content>
        </ng-template>

        @if (vm.menu() === 'desktop') {
            <!-- DESKTOP -->
            <nav class="ngx-van-ssr">
                <ng-template [ngTemplateOutlet]="navContent"></ng-template>
            </nav>
        } @else if (vm.menu() === 'mobile') {
            <!-- MOBILE -->
            <ng-template #portal>
                <nav
                    [style]="voidMobileStyle()"
                    [cdkTrapFocus]="vm.isOpen()"
                    [@nav]="navStates$ | async"
                    (@nav.done)="closeMobileMenuOnAnimationDone($event)"
                >
                    <ng-template [ngTemplateOutlet]="navContent"></ng-template>
                </nav>
            </ng-template>
        }
    `,
    providers: [NgxVanService],
    imports: [AsyncPipe, A11yModule, NgTemplateOutlet],
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

    /**
     * Portal for mobile menu
     */
    private readonly portalRef = viewChild.required<TemplateRef<HTMLElement>>('portal');
    private readonly portalTpl = computed(
        () => new TemplatePortal(this.portalRef(), this.viewContainer),
    );

    /**
     * Void (initial) style for mobile menu (and mobile animations)
     * - needs to be set dynamically, so declared in component scope
     */
    protected readonly voidMobileStyle = computed(() => {
        if (this.vm.menu() === 'mobile') {
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
     * Readonly vm properties accessible in templates
     */
    readonly vm = {
        menu: this.ngxVanService.menu.asReadonly(),
        isOpen: this.ngxVanService.isOpen.asReadonly(),
    };

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
                this.portalRef().elementRef.nativeElement,
                this.portalTpl(),
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
