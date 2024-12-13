import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxCurrencyDirective } from 'ngx-currency';
import { MomentModule } from 'ngx-moment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    NgbTypeaheadModule,
    NgbAccordionModule,
    NgbCarouselModule,
    NgbTooltipModule,
    NgbModalModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { AppTituloModalAlertComponent } from './modals/app-titulo-modal-alert/app-titulo-modal-alert.component';
import { AppTotvsModalConfirmComponent } from './modals/app-titulo-modal-confirm/app-titulo-modal-confirm.component';
import { TotvsComponent } from './totvs.component';
import { TotvsClienteComponent } from './totvs-cliente/totvs-cliente.component';
import { TotvsRoutingModule } from './totvs-routing.module';
import { TotvsService } from './totvs.service';
import { TotvsItemComponent } from './totvs-item/totvs-item.component';
import { TotvsCondicaoComponent } from './totvs-condicao/totvs-condicao.component';
import { TotvsVendaComponent } from './totvs-venda/totvs-venda.component';
import { SharedModule } from '@modules/shared/shared.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { PageHeaderModule } from '@modules/page-header/page-header.module';
import { AppFilialComponent } from './modals/app-filial-modal-confirm/app-filial-modal-confirm.component';
import { TotvsPrecoComponent } from './totvs-preco/totvs-preco.component';

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

    NgxDatatableModule,
    NgxCurrencyDirective,
    MomentModule,
    NgSelectModule,
    NgxSpinnerModule,
    TotvsRoutingModule,

    SharedModule,

    NavigationModule,
];

const ROUTED_COMPONENTS = [
    TotvsComponent,
    TotvsClienteComponent,
    TotvsItemComponent,
    TotvsCondicaoComponent,
    TotvsVendaComponent,
    TotvsPrecoComponent,

    AppTituloModalAlertComponent,
    AppTotvsModalConfirmComponent,
    AppFilialComponent,
];

const PROVIDERS = [
    TotvsService,
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
    ]
})
export class TotvsModule { }
