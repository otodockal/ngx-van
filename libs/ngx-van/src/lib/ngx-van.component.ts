import { AnimationEvent } from '@angular/animations';
import { Platform } from '@angular/cdk/platform';
import { TemplatePortal } from '@angular/cdk/portal';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    Input,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { combineLatest, takeUntil } from 'rxjs';
import { ngxVanAnimations } from './ngx-van-animations';
import { NgxVanService } from './ngx-van.service';

@Component({
    selector: 'ngx-van',
    exportAs: 'ngxVan',
    animations: [ngxVanAnimations],
    template: `
        <!-- MOBILE: lazy, instatiate on demand using toggleMobileMenu() -->
        <!-- DESKTOP: content for desktop -->
        <ng-template #navContainer>
            <nav
                [style]="_voidMobileStyle"
                [@nav]="_events$ | async"
                (@nav.done)="toggleMobileMenuAnimationDone($event)"
                [cdkTrapFocus]="isOpen"
            >
                <ng-content></ng-content>
            </nav>
        </ng-template>
        <!-- DESKTOP -->
        <div class="ngx-van-ssr" *ngIf="menu === 'desktop'" [@.disabled]="true">
            <ng-template [cdkPortalOutlet]="_navContainerPortal"></ng-template>
        </div>
    `,
    providers: [NgxVanService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxVanComponent implements OnInit, AfterViewInit {
    private readonly _ngxVanService = inject(NgxVanService);
    private readonly _viewContainer = inject(ViewContainerRef);
    private readonly _isBrowser = inject(Platform).isBrowser;
    private readonly _cd = inject(ChangeDetectorRef);

    @Input() side: 'start' | 'end' = 'end';
    @Input() breakpoint: number | null = 991;

    @ViewChild('navContainer')
    private readonly _navContainerTpl: TemplateRef<HTMLElement> | null = null;

    protected _navContainerPortal: TemplatePortal<any> | null = null;
    protected get _voidMobileStyle() {
        if (this.menu === 'mobile') {
            return this.side === 'end'
                ? 'position: fixed; right: 0; transform: translateX(100%)'
                : 'position: fixed; left: 0; transform: translateX(-100%)';
        }
        return null;
    }

    readonly _events$ = this._ngxVanService.events$;
    isOpen = false;
    menu: 'mobile' | 'desktop' | null = null;

    ngOnInit() {
        if (this._isBrowser) {
            this._ngxVanService.listenOnResize(this.breakpoint);
            combineLatest({
                isOpen: this._ngxVanService.isOpen$,
                menu: this._ngxVanService.menu$,
            })
                .pipe(takeUntil(this._ngxVanService.onDestroy$))
                .subscribe(({ isOpen, menu }) => {
                    this.isOpen = isOpen;
                    this.menu = menu;
                    this._cd.markForCheck();
                });
        } else {
            this._ngxVanService.menu$.next('desktop');
        }
    }

    ngAfterViewInit() {
        Promise.resolve().then(() => {
            if (this._navContainerTpl) {
                this._navContainerPortal = new TemplatePortal(
                    this._navContainerTpl,
                    this._viewContainer
                );
            }
            this._cd.markForCheck();
        });
    }

    toggleMobileMenu(triggerEl: HTMLElement) {
        if (this._ngxVanService.isOpen$.value) {
            this._ngxVanService.scheduleClose(this.side);
        } else {
            if (this._navContainerTpl && this._navContainerPortal) {
                this._ngxVanService.open(
                    triggerEl,
                    this._navContainerTpl.elementRef.nativeElement,
                    this._navContainerPortal,
                    this.side
                );
            }
        }
    }

    toggleMobileMenuAnimationDone(e: AnimationEvent) {
        if (e.toState === 'closeLeft' || e.toState === 'closeRight') {
            this._ngxVanService.dispose();
        }
    }

    closeMobileMenu() {
        this._ngxVanService.scheduleClose(this.side);
    }

    closeMobileMenuNow() {
        this._ngxVanService.dispose();
    }
}
