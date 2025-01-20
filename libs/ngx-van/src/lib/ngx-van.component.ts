import { A11yModule } from '@angular/cdk/a11y';
import { Platform } from '@angular/cdk/platform';
import { TemplatePortal } from '@angular/cdk/portal';
import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    TemplateRef,
    ViewContainerRef,
    computed,
    inject,
    input,
    viewChild,
} from '@angular/core';
import { CloseOnBackdropClick, CloseOnEscapeKeyClick, MenuSide, NavState } from './ngx-van';
import { styleTransform, style } from './ngx-van-animations';
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
                    [style]="style()"
                    [style.transition]="styleTransition()"
                    [style.transform]="styleTransform()"
                    [cdkTrapFocus]="vm.isOpen()"
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
export class NgxVan implements OnInit {
    private readonly ngxVanService = inject(NgxVanService);
    private readonly viewContainer = inject(ViewContainerRef);
    private readonly isBrowser = inject(Platform).isBrowser;

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

    /**
     * Dispose mobile menu on animation done
     */
    protected transitionend(state: NavState) {
        if (state === 'closeLeft' || state === 'closeRight') {
            this.disposeMobileMenu();
        }
    }
}
