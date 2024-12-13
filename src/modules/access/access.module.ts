/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthUtilsModule } from '@modules/auth-utils/auth-utils.module';
import * as accessComponents from './components';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { AccessService } from './access.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        NavigationModule,
        NgxSpinnerModule,
        AuthUtilsModule,
        NgSelectModule,
        NgxDatatableModule,
    ],
    providers: [AccessService],
    declarations: [...accessComponents.containers],
    exports: [],
})
export class AccessModule { }

