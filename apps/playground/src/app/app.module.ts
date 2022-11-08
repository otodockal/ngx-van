import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { NgxVanModule } from 'ngx-van';
import { IconComponent } from './icon/icon.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, IconComponent, NgxVanModule, BrowserAnimationsModule],
    bootstrap: [AppComponent],
})
export class AppModule {}
