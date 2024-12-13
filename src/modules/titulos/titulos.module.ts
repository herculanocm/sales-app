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
import { TitulosRoutingModule } from './titulos-routing.module';
import { TitulosComponent } from './titulos.component';
import { TituloReceberComponent } from './titulo-receber/titulo-receber.component';
import { AppResizeWatcherDirective } from './titulos.directives';
import { AppTituloModalAlertComponent } from './modals/app-titulo-modal-alert/app-titulo-modal-alert.component';
import { AppTituloModalConfirmComponent } from './modals/app-titulo-modal-confirm/app-titulo-modal-confirm.component';
import { AppTituloModalAlertListComponent } from './modals/app-titulo-modal-alert-list/app-titulo-modal-alert-list.component';
import { ChequeRecebidosComponent } from './cheques-recebidos/cheques-recebidos.component';
import { AppTituloModalAlertValidComponent } from './modals/app-titulo-modal-alert-valid/app-titulo-modal-alert-valid.component';
import { TituloTotvsComponent } from './titulo-totvs/titulo-totvs.component';
import { SharedModule } from '@modules/shared/shared.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { PageHeaderModule } from '@modules/page-header/page-header.module';
import { TitReceberLotComponent } from './tit-receber-lot/tit-receber-lot.component';
import { TituloCsvComponent } from './titulo-csv/titulo-csv.component';
import { NgxCsvParserModule } from 'ngx-csv-parser';
import { NgbdModalConfirmAuxComponent, NgbdModalMessageAuxComponent } from './titulos.utils';
import { GrupoDespesaComponent } from './grupo-despesa/grupo-despesa.component';
import { SubGrupoDespesaComponent } from './sub-grupo-despesa/sub-grupo-despesa.component';
import { TituloDespesaComponent } from './titulo-despesa/titulo-despesa.component';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

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
    TitulosRoutingModule,
    NgxCsvParserModule,
    NgxMaskDirective, 
    NgxMaskPipe
];

const ROUTED_COMPONENTS = [
    TitulosComponent,
    TituloReceberComponent,
    ChequeRecebidosComponent,

    AppResizeWatcherDirective,

    AppTituloModalAlertComponent,
    AppTituloModalConfirmComponent,
    AppTituloModalAlertListComponent,
    AppTituloModalAlertValidComponent,
    TitReceberLotComponent,
    TituloTotvsComponent,
    TituloCsvComponent,
    NgbdModalConfirmAuxComponent,
    NgbdModalMessageAuxComponent,
    TituloDespesaComponent,
    GrupoDespesaComponent,
    SubGrupoDespesaComponent,
];

@NgModule({
    imports: [
        ...IMPORTS,
    ],
    declarations: [
        ...ROUTED_COMPONENTS,
    ],
    providers: [ provideNgxMask() ]
})
export class TitulosModule { }
