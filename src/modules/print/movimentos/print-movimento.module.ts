import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrintMovimentoComponent } from './print-movimento.component';
import { PrintMovimentoRoutingModule } from './print-movimento-routing.module';
import { FormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';
import { PrintMovimentoService } from './print-movimento.service';
import { NgxSpinnerModule } from 'ngx-spinner';

const IMPORTS = [
    CommonModule,
    FormsModule,
    MomentModule,
    NgxSpinnerModule,
    PrintMovimentoRoutingModule,
];
const ROUTED_COMPONENTS = [
    PrintMovimentoComponent,
];
const PROVIDERS = [
    PrintMovimentoService,
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
export class PrintMovimentoModule { }
