import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';
import { CaixaPrintRoutingModule } from './caixa-routing.module';
import { CaixaPrintComponent } from './caixa.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CaixaPrintService } from './caixa.service';

const IMPORTS = [
    CommonModule,
    FormsModule,
    MomentModule,

    NgxSpinnerModule,

    CaixaPrintRoutingModule,
];
const ROUTED_COMPONENTS = [
    CaixaPrintComponent,
];

const PROVIDERS = [
    CaixaPrintService,
];

@NgModule({
    imports: [
        ...IMPORTS,
    ],
    declarations: [
        ...ROUTED_COMPONENTS,
    ],
    providers: [
        ...PROVIDERS,
    ],
})
export class CaixaPrintModule { }
