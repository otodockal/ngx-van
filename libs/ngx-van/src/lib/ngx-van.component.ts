import { A11yModule } from '@angular/cdk/a11y';
import { TemplatePortal } from '@angular/cdk/portal';
import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    TemplateRef,
    ViewContainerRef,
    computed,
    effect,
    inject,
    input,
    viewChild,
} from '@angular/core';
import { CloseOnBackdropClick, CloseOnEscapeKeyClick, MenuSide, NavState } from './ngx-van';
import { style, styleTransform } from './ngx-van-animations';
import { NgxVanService } from './ngx-van.service';

@Component({
    selector: 'ngx-van',
    exportAs: 'ngxVan',
    template: `
        @if (vm.menu() === 'desktop') {
            <nav class="ngx-van-ssr">
                <ng-container [ngTemplateOutlet]="content" />
            </nav>
        } @else if (vm.menu() === 'mobile') {
            <ng-template #portal>
                <nav
                    [cdkTrapFocus]="vm.isOpen()"
                    [style]="style()"
                    [style.transform]="styleTransform()"
                    [style.transition]="styleTransition()"
                    (transitionend)="transitionend(navState())"
                >
                    <ng-container [ngTemplateOutlet]="content" />
                </nav>
            </ng-template>
        }
        <ng-template #content><ng-content /></ng-template>
    `,
    providers: [NgxVanService],
    imports: [A11yModule, NgTemplateOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxVan {
    private readonly ngxVanService = inject(NgxVanService);
    private readonly viewContainer = inject(ViewContainerRef);

    side = input<MenuSide>('end');
    breakpoint = input<number | null>(991);
    closeOnEscapeKeyClick = input<CloseOnEscapeKeyClick>('close');
    closeOnBackdropClick = input<CloseOnBackdropClick>('close');
    styleTransition = input('transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1)');

    /**
     * Portal for mobile menu
     */
    private readonly portalRef = viewChild.required<TemplateRef<HTMLElement>>('portal');
    private readonly portalTpl = computed(
        () => new TemplatePortal(this.portalRef(), this.viewContainer),
    );

    /**
     * Readonly vm properties accessible in templates
     */
    readonly vm = {
        menu: this.ngxVanService.menu.asReadonly(),
        isOpen: this.ngxVanService.isOpen.asReadonly(),
    };

    protected readonly navState = this.ngxVanService.navState.asReadonly();
    protected readonly style = style(this.vm.menu, this.side);
    protected readonly styleTransform = styleTransform(this.navState, this.side);

    constructor() {
        effect((cleanup) => {
            const subs = this.ngxVanService.onResize(this.side(), this.breakpoint());
            cleanup(() => subs?.unsubscribe());
        });
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
     * Closes the mobile menu with animation
     */
    closeMobileMenu() {
        this.ngxVanService.close(this.side());
    }

    /**
     * Closes the mobile menu immediately without animation
     */
    disposeMobileMenu() {
        this.ngxVanService.dispose(this.side());
    }

    /**
     * Handles the transition end event for menu animations
     */
    protected transitionend(state: NavState) {
        if (state === 'closeLeft' || state === 'closeRight') {
            this.disposeMobileMenu();
        }
    }
}
