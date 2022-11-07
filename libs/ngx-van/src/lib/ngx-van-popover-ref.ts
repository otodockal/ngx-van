import { OverlayRef } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';
import { inject } from '@angular/core';

export class NgxVanPopoverRef<T = any> {
    private readonly _overlayRef = inject(OverlayRef);

    private _afterClosed = new Subject<any>();

    close(dialogResult?: T): void {
        // TODO: take into account animations!
        this._afterClosed.next(dialogResult);
        this._afterClosed.complete();
        this._overlayRef.dispose();
    }

    afterClosed(): Observable<T> {
        return this._afterClosed.asObservable();
    }
}
