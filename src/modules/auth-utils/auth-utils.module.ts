/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthUtilsService } from './auth-utils.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule
    ],
    providers: [
        AuthUtilsService
    ],
    declarations: [],
    exports: [],
})
export class AuthUtilsModule { }

