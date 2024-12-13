import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxCurrencyDirective } from 'ngx-currency';
import { MomentModule } from 'ngx-moment';
import { ConfiguracoesModule } from '../configuracoes/configuracoes.module';
import { VendasRoutingModule } from './vendas-routing.module';
import { ClientesModule } from '../clientes/clientes.module';
import { FuncionariosModule } from '../funcionarios/funcionarios.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VendasComponent } from './vendas.component';
import { AppVendaModalConfirmComponent } from './modals/app-venda-modal-confirm/app-venda-modal-confirm.component';
import { AppVendaModalClienteListComponent } from './modals/app-venda-modal-cliente-list/app-venda-modal-cliente-list.component';
import {
    NgbTypeaheadModule,
    NgbAccordionModule,
    NgbCarouselModule,
    NgbTooltipModule,
    NgbModalModule,
    NgbNavModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { AcessosModule } from '../acessos/acessos.module';
import { ItensModule } from '../itens/itens.module';
import { AppVendaModalClientePesqavComponent } from './modals/app-venda-modal-cliente-pesqav/app-venda-modal-cliente-pesqav.component';
import { AppVendaModalItemPesqavComponent } from './modals/app-venda-modal-item-pesqav/app-venda-modal-item-pesqav.component';
import { AppVendaModalAlertComponent } from './modals/app-venda-modal-alert/app-venda-modal-alert.component';
import { AppVendaModalAlertListComponent } from './modals/app-venda-modal-alert-list/app-venda-modal-alert-list.component';
import { AppResizeWatcherDirective } from './vendas.directives';
import { AppVendaModalConfirmJustComponent } from './modals/app-venda-modal-confirm-just/app-venda-modal-confirm-just.component';
import { VeiculosModule } from '../veiculos/veiculos.module';
import { VendaRepreComponent } from './venda-repre/venda-repre.component';
import { ReportRepreComponent } from './report-repre/report-repre.component';
import { AppVendaModalTitulosComponent } from './modals/app-venda-modal-titulos/app-venda-modal-titulos.component';
import { ReportItensComponent } from './report-itens/report-itens.component';
import { AppVendaModalConfirmJust2Component } from './modals/app-venda-modal-confirm-just2/app-venda-modal-confirm-just2.component';
import { VendaDectivateService } from './venda-deactivate.service';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import {
    AppVendaModalClienteTopItensComponent
} from './modals/app-venda-modal-cliente-topitens/app-venda-modal-cliente-topitens.component';
import { ReportGrupoComponent } from './report-grupo/report-grupo.component';
import { EstoquesModule } from '../estoques/estoques.module';
import { AppVendaModalCancelamentoComponent } from './modals/app-venda-modal-cancelamento/app-venda-modal-cancelamento.component';
import { VendaAprovaComponent } from './venda-aprova/venda-aprova.component';
import { VendaRotaComponent } from './venda-rota/venda-rota.component';
import { AppVendaModalChecklistImgComponent } from './modals/app-venda-modal-checklist-img/app-venda-modal-checklist-img.component';
import { AppVendaModalAlxConfirmComponent } from './modals/app-venda-modal-confirm-alx/app-venda-modal-confirm-alx.component';
import { RomaneioComponent } from './romaneio/romaneio.component';
import { AppVendaModalAlertPreVendaComponent } from './modals/app-venda-modal-prev/app-venda-modal-prev.component';
import { AppVendaModalAlertAcoesVendaComponent } from './modals/app-venda-modal-acoes/app-venda-modal-acoes.component';
import { CaixaComponent } from './caixa/caixa.component';
import { AppVendaModalRomaneioComponent } from './modals/app-venda-modal-romaneio/app-venda-modal-romaneio.component';
import { AppVendaModalCaixaRowComponent } from './modals/app-venda-modal-caixa-row/app-venda-modal-caixa-row.component';
import { AppVendaModalMapComponent } from './modals/app-venda-modal-map/app-venda-modal-map.component';
import { AppVendaModalWebRotaComponent } from './modals/app-venda-modal-webrota/app-venda-modal-webrota.component';
import { SharedModule } from '@modules/shared/shared.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { PageHeaderModule } from '@modules/page-header/page-header.module';
import { VendaComponent } from './venda/venda.component';
import { IconsModule } from '@modules/icons/icons.module';
import { VendaConfirmModalComponent } from './modals/venda-confirm-modal.component';
import { PdvComponent } from './pdv/pdv.component';
import {HotkeyModule} from 'angular2-hotkeys';
import { ModalPdvItemComponent } from './modal-pdv-item/modal-pdv-item.component';
import { ModalPdvItemRemoveComponent } from './modal-pdv-item-remove/modal-pdv-item-remove.component';
import { ModalVendasAlertComponent } from './modal-alert/modal-alert.component';
import { ModalVendasConfirmComponent } from './modal-confirm/modal-confirm.component';
import { ModalRepreClientComponent } from './modal-repre-client/modal-repre-client.component';
import { PlanilhaReportComponent } from './planilha-report/planilha-report.component';
import { ModalFaturarMultiplasComponent } from './modal-faturar-multiplas/modal-faturar-multiplas.component';
import { AppRomModalSearchComponent } from './modals/app-rom-modal-search/app-rom-modal-search.component';
import { AppModalRomaneioAddMultiplasComponent } from './modals/app-rom-modal-msgs/app-rom-modal-msgs.component';
import { ReportVendaComponent } from './report-venda/report-venda.component';


const IMPORTS = [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    NgbTypeaheadModule,
    NgbNavModule,
    NgbAccordionModule,
    NgbCarouselModule,
    NgbTooltipModule,
    NgbModalModule,

    PageHeaderModule,
    SharedModule,
    IconsModule,
    NavigationModule,

    NgxMaskDirective, NgxMaskPipe,
    NgxDatatableModule,
    NgxCurrencyDirective,
    MomentModule,
    NgSelectModule,
    NgxSpinnerModule,
    AcessosModule,
    EstoquesModule,
    ConfiguracoesModule,
    ClientesModule,
    FuncionariosModule,
    VeiculosModule,
    ItensModule,
    VendasRoutingModule,
    HotkeyModule.forRoot(),
];
// comment
const ROUTED_COMPONENTS = [
    VendasComponent,
    VendaComponent,
    RomaneioComponent,
    ReportItensComponent,
    VendaRepreComponent,
    ReportRepreComponent,
    ReportGrupoComponent,
    AppResizeWatcherDirective,
    AppVendaModalConfirmComponent,
    AppVendaModalClienteListComponent,
    AppVendaModalClientePesqavComponent,
    AppVendaModalItemPesqavComponent,
    AppVendaModalAlertComponent,
    AppVendaModalAlertListComponent,
    AppVendaModalConfirmJustComponent,
    AppVendaModalConfirmJust2Component,
    AppVendaModalCancelamentoComponent,
    AppVendaModalTitulosComponent,
    AppVendaModalClienteTopItensComponent,
    AppVendaModalChecklistImgComponent,
    AppVendaModalAlxConfirmComponent,
    AppVendaModalAlertPreVendaComponent,
    AppVendaModalAlertAcoesVendaComponent,
    AppVendaModalRomaneioComponent,
    AppModalRomaneioAddMultiplasComponent,
    AppRomModalSearchComponent,
    VendaAprovaComponent,
    VendaRotaComponent,
    CaixaComponent,
    AppVendaModalCaixaRowComponent,
    AppVendaModalMapComponent,
    AppVendaModalWebRotaComponent,
    VendaConfirmModalComponent,
    PdvComponent,
    ModalPdvItemComponent,
    ModalPdvItemRemoveComponent,
    ModalVendasAlertComponent,
    ModalVendasConfirmComponent,
    ModalRepreClientComponent,
    PlanilhaReportComponent,
    ModalFaturarMultiplasComponent,
    ReportVendaComponent
];

const PROVIDERS = [
    VendaDectivateService,
];

@NgModule({
    imports: [
        ...IMPORTS,
    ],
    declarations: [
        ...ROUTED_COMPONENTS,
    ],
    providers: [
        provideNgxMask(),
        ...PROVIDERS,
    ]
})
export class VendasModule { }
