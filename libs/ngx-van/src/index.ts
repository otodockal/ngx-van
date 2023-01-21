import { NgModule } from '@angular/core';
import { NgxVanItemDirective } from './lib/ngx-van-item.directive';
import { NgxVanTriggerForDirective } from './lib/ngx-van-trigger-for.directive';
import { NgxVanComponent } from './lib/ngx-van.component';

export * from './lib/ngx-van-item.directive';
export * from './lib/ngx-van-trigger-for.directive';
export * from './lib/ngx-van.component';

const SHELL = [NgxVanItemDirective, NgxVanTriggerForDirective, NgxVanComponent];

@NgModule({
    imports: [SHELL],
    exports: [SHELL],
})
export class NgxVan {}
