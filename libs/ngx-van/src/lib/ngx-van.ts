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
import { style, styleTransform } from './ngx-van-animations';
import { NgxVanOverlay } from './ngx-van-overlay';

export type NavState = 'openLeft' | 'closeLeft' | 'openRight' | 'closeRight' | null;

export type MenuType = 'mobile' | 'desktop' | null;

export type MenuSide = 'start' | 'end';

export type CloseOnEscapeKeyClick = 'close' | 'dispose' | false;

export type CloseOnBackdropClick = 'close' | 'dispose' | false;

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
                    [style.transform]="transform()"
                    [style.transition]="transition()"
                    (transitionend)="transitionend(navState())"
                >
                    <ng-container [ngTemplateOutlet]="content" />
                </nav>
            </ng-template>
        }
        <ng-template #content><ng-content /></ng-template>
    `,
    providers: [NgxVanOverlay],
    imports: [A11yModule, NgTemplateOutlet],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxVan {
    private readonly ngxVanOverlay = inject(NgxVanOverlay);
    private readonly viewContainer = inject(ViewContainerRef);

    readonly side = input<MenuSide>('end');
    readonly breakpoint = input<number | null>(991);
    readonly closeOnBackdropClick = input<CloseOnBackdropClick>('close');
    readonly closeOnEscapeKeyClick = input<CloseOnEscapeKeyClick>('close');
    readonly transition = input('transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1)');

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
        menu: this.ngxVanOverlay.menu.asReadonly(),
        isOpen: this.ngxVanOverlay.isOpen.asReadonly(),
    };

    protected readonly navState = this.ngxVanOverlay.navState.asReadonly();
    protected readonly style = style(this.vm.menu, this.side);
    protected readonly transform = styleTransform(this.navState, this.side);

    constructor() {
        effect((cleanup) => {
            const subs = this.ngxVanOverlay.onResize(this.side(), this.breakpoint());
            cleanup(() => subs?.unsubscribe());
        });
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu(triggerEl: HTMLElement) {
        if (this.ngxVanOverlay.isOpen()) {
            this.closeMobileMenu();
        } else {
            this.ngxVanOverlay.open(
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
        this.ngxVanOverlay.close(this.side());
    }

    /**
     * Closes the mobile menu immediately without animation
     */
    disposeMobileMenu() {
        this.ngxVanOverlay.dispose(this.side());
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
