import { AnimationEvent } from '@angular/animations';
import { Platform } from '@angular/cdk/platform';
import { TemplatePortal } from '@angular/cdk/portal';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { takeUntil } from 'rxjs';
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
                [cdkTrapFocus]="isOpen$ | async"
            >
                <ng-content></ng-content>
            </nav>
        </ng-template>
        <!-- DESKTOP -->
        <div class="ngx-van-ssr" *ngIf="(menu$ | async) === 'desktop'" [@.disabled]="true">
            <ng-template [cdkPortalOutlet]="_navContainerPortal"></ng-template>
        </div>
    `,
    providers: [NgxVanService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxVanComponent {
    @Input() side: 'start' | 'end' = 'end';
    @Input() breakpoint: number | null = 991;

    @ViewChild('navContainer')
    private _navContainerTpl: TemplateRef<HTMLElement> | null = null;

    isOpen: boolean = false;
    isOpen$ = this._ngxVanService.isOpen$;
    menu: 'mobile' | 'desktop' | null = null;
    menu$ = this._ngxVanService.menu$;

    _events$ = this._ngxVanService.events$;
    _navContainerPortal: TemplatePortal<any> | null = null;
    get _voidMobileStyle() {
        if (this.menu === 'mobile') {
            return this.side === 'end'
                ? 'position: fixed; right: 0; transform: translateX(100%)'
                : 'position: fixed; left: 0; transform: translateX(-100%)';
        }
        return null;
    }

    constructor(
        private _ngxVanService: NgxVanService,
        private _viewContainer: ViewContainerRef,
        private _platform: Platform,
        private _cd: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        if (this._platform.isBrowser) {
            this._ngxVanService.listenOnResize(this.breakpoint);
            this._ngxVanService.isOpen$
                .pipe(takeUntil(this._ngxVanService.onDestroy$))
                .subscribe((e) => {
                    this.isOpen = e;
                    this._cd.markForCheck();
                });
            this._ngxVanService.menu$
                .pipe(takeUntil(this._ngxVanService.onDestroy$))
                .subscribe((e) => {
                    this.menu = e;
                    this._cd.markForCheck();
                });
        } else {
            this._ngxVanService.menu$.next('desktop');
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

    toggleMobileMenu(triggerEl: HTMLElement) {
        if (this._ngxVanService.isOpen$.value) {
            this._ngxVanService.scheduleClose(this.side);
        } else {
            this._ngxVanService.open(
                triggerEl,
                this._navContainerTpl!.elementRef.nativeElement,
                this._navContainerPortal!,
                this.side,
            );
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
