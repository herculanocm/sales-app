import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxCurrencyDirective } from 'ngx-currency';
import { MomentModule } from 'ngx-moment';
import { ConfiguracoesModule } from '../configuracoes/configuracoes.module';
import { ClientesModule } from '../clientes/clientes.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    NgbTypeaheadModule,
    NgbAccordionModule,
    NgbCarouselModule,
    NgbTooltipModule,
    NgbModalModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { AcessosModule } from '../acessos/acessos.module';
import { FluxoRoutingModule } from './fluxo-routing.module';
import { FluxoComponent } from './fluxo.component';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { SharedModule } from '@modules/shared/shared.module';
import { PageHeaderModule } from '@modules/page-header/page-header.module';

import * as components from './components';

const IMPORTS = [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    NgbTypeaheadModule,
    NgbAccordionModule,
    NgbCarouselModule,
    NgbTooltipModule,
    NgbModalModule,

    PageHeaderModule,
    SharedModule,

    NavigationModule,
    NgxDatatableModule,
    NgxCurrencyDirective,
    MomentModule,
    NgSelectModule,
    NgxSpinnerModule,

    AcessosModule,
    ConfiguracoesModule,
    ClientesModule,
    NgxMaskDirective, 
    NgxMaskPipe,
    FluxoRoutingModule
];

const ROUTED_COMPONENTS = [
    FluxoComponent
];

@NgModule({
    imports: [
        ...IMPORTS,
    ],
    declarations: [
        ...ROUTED_COMPONENTS, ...components.components
    ],
    providers: [ provideNgxMask() ]
})
export class FluxoModule { }
