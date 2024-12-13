import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';
import { ChequePrintRoutingModule } from './cheque-routing.module';
import { ChequePrintComponent } from './cheque.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ChequePrintService } from './cheque.service';

const IMPORTS = [
    CommonModule,
    FormsModule,
    MomentModule,

    NgxSpinnerModule,

    ChequePrintRoutingModule,
];
const ROUTED_COMPONENTS = [
    ChequePrintComponent,
];

const PROVIDERS = [
    ChequePrintService,
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
export class ChequePrintModule { }
