import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { DeletedComponent } from './deleted.component';
import { DraftsComponent } from './drafts.component';
import { ImportantComponent } from './important.component';
import { InboxComponent } from './inbox.component';
import { StarredComponent } from './starred.component';

export const appConfig: ApplicationConfig = {
    providers: [
        provideAnimations(),
        provideRouter([
            { path: '', component: InboxComponent },
            { path: 'starred', component: StarredComponent },
            { path: 'important', component: ImportantComponent },
            { path: 'drafts', component: DraftsComponent },
            { path: 'deleted', component: DeletedComponent },
        ]),
    ],
};
