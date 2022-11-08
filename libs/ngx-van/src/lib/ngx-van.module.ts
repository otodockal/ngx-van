import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxVanItemDirective } from './ngx-van-item.directive';
import { NgxVanTriggerForDirective } from './ngx-van-trigger-for.directive';
import { NgxVanComponent } from './ngx-van.component';

const COMPONENTS = [NgxVanComponent, NgxVanItemDirective, NgxVanTriggerForDirective];

@NgModule({
    imports: [CommonModule, PortalModule, OverlayModule, A11yModule],
    declarations: [COMPONENTS],
    exports: [COMPONENTS],
})
export class NgxVanModule {}
