import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxVanComponent } from './ngx-van.component';

describe('NgxVanComponent', () => {
    let component: NgxVanComponent;
    let fixture: ComponentFixture<NgxVanComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NgxVanComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NgxVanComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
