import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FluxoClienteSinteticoPrintComponent } from './fluxo-cliente-sintetico.component';
import { FluxoClienteSinteticoPrintRoutingModule } from './fluxo-cliente-sintetico-routing.module';

const IMPORTS = [
    CommonModule,
    FormsModule,
    MomentModule,

    NgxSpinnerModule,

    FluxoClienteSinteticoPrintRoutingModule,
];
const ROUTED_COMPONENTS = [
    FluxoClienteSinteticoPrintComponent,
];


@NgModule({
    imports: [
        ...IMPORTS,
    ],
    declarations: [
        ...ROUTED_COMPONENTS,
    ],
})
export class FluxoClienteSinteticoPrintModule { }
