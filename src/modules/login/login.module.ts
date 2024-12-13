import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { LoginService } from './login.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgbdModalMessageComponent } from './login.utils';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { IconsModule } from '@modules/icons/icons.module';
import { LoginComponent } from './login.component';
import { LogoutComponent } from './logout.component';
import { ChangePassComponent } from './change-pass/change-pass.component';
import { SharedModule } from '@modules/shared/shared.module';

const PROVIDERS = [
    LoginService,
  ];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        LoginRoutingModule,
        NgxSpinnerModule,
        NgbModalModule,
        SharedModule,
        IconsModule,
    ],
    declarations: [ LoginComponent, LogoutComponent, ChangePassComponent, NgbdModalMessageComponent ],
    providers: [...PROVIDERS],
})
export class LoginModule {}
