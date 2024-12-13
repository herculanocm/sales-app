/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import * as pagesComponents from './components';
import { NavigationModule } from '@modules/navigation/navigation.module';

import * as pagesServices from './services';
import { PageHeaderModule } from '@modules/page-header/page-header.module';
import { SharedModule } from '@modules/shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        NavigationModule,
        PageHeaderModule,
        NgxSpinnerModule,
        SharedModule
    ],
    providers: [...pagesServices.services],
    declarations: [...pagesComponents.components],
    exports: [],
})
export class PagesModule {}
