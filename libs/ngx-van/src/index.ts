import { NgxVanItemDirective } from './lib/ngx-van-item.directive';
import { NgxVanTriggerForDirective } from './lib/ngx-van-trigger-for.directive';
import { NgxVanComponent } from './lib/ngx-van.component';

export * from './lib/ngx-van.component';
export * from './lib/ngx-van-item.directive';
export * from './lib/ngx-van-trigger-for.directive';

export const NgxVan = [NgxVanItemDirective, NgxVanTriggerForDirective, NgxVanComponent];
