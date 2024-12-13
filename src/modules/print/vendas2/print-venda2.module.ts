import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrintVenda2Component } from './print-venda2.component';
import { PrintVenda2RoutingModule } from './print-venda2-routing.module';
import { FormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';
import { PrintVenda2Service } from './print-venda2.service';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

const IMPORTS = [
    CommonModule,
    FormsModule,
    MomentModule,
    PrintVenda2RoutingModule,
    NgxMaskDirective,
    NgxMaskPipe,
];
const ROUTED_COMPONENTS = [
    PrintVenda2Component,
];
const PROVIDERS = [
    PrintVenda2Service,
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
export class PrintVenda2Module { }
