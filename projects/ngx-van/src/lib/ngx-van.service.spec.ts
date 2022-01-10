import { TestBed } from '@angular/core/testing';

import { NgxVanService } from './ngx-van.service';

describe('NgxVanService', () => {
    let service: NgxVanService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(NgxVanService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
