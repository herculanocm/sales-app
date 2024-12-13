/* tslint:disable: ordered-imports*/
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


/* Services */
import * as navigationServices from './services';

/* Components */
import * as navigationComponents from './components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
    imports: [
        CommonModule, 
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModalModule,
        NgxSpinnerModule
    ],
    declarations: [
        ...navigationComponents.components,
    ],
    exports: [
        ...navigationComponents.components,
    ],
    providers: [
        ...navigationServices.services
    ],
})
export class SharedModule {
    static forRoot(): ModuleWithProviders<SharedModule> {
        return {
            ngModule: SharedModule,
            providers: [],
        };
    }
}
