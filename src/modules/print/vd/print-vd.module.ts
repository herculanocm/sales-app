import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrintVendaComponent } from './print-venda.component';
import { PrintVendaRoutingModule } from './print-venda-routing.module';
import { FormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';
import { PrintVendaService } from './print-venda.service';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

const IMPORTS = [
    CommonModule,
    FormsModule,
    MomentModule,
    PrintVendaRoutingModule,
    NgxMaskDirective, NgxMaskPipe
];
const ROUTED_COMPONENTS = [
    PrintVendaComponent,
];
const PROVIDERS = [
    PrintVendaService,
    provideNgxMask(),
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
export class PrintVdModule { }
