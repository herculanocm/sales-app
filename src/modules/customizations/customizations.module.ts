/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthUtilsModule } from '@modules/auth-utils/auth-utils.module';
import * as customizationsComponents from './components';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { CustomizationsService } from './customizations.service';
import { MomentModule } from 'ngx-moment';
import { AccessModule } from '@modules/access/access.module';
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
        MomentModule,
        AccessModule,
        NgxDatatableModule,
    ],
    providers: [CustomizationsService],
    declarations: [...customizationsComponents.containers],
    exports: [],
})
export class CustomizationsModule { }

