import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ConfiguracoesRoutingModule,
} from './configuracoes-routing.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModalModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ConfiguracoesComponent } from './configuracoes.component';
import { CondicaoPagamentoComponent } from './condicao-pagamento/condicao-pagamento.component';
import { ConfGeraisComponent } from './conf-gerais/conf-gerais.component';
import { AppConfigModalConfirmComponent } from './modals/app-config-modal-confirm/app-config-modal-confirm.component';
import { ExecutorComponent } from './executor/executor.component';
import { SharedModule } from '@modules/shared/shared.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { PageHeaderModule } from '@modules/page-header/page-header.module';
import  { TwilioSMSComponent } from './sms/sms.component';
import { ConfMsgComponent } from './conf-msg/conf-msg.component';

const ROUTED_COMPONENTS = [
    ConfiguracoesComponent,
    CondicaoPagamentoComponent,
    ConfGeraisComponent,
    ExecutorComponent,
    AppConfigModalConfirmComponent,
    TwilioSMSComponent,
    ConfMsgComponent,
];

const IMPORTS = [
    CommonModule,
    FormsModule,

    ReactiveFormsModule,

    NgbNavModule,
    SharedModule,
    NgxDatatableModule,
    NgxSpinnerModule,
    PageHeaderModule,
    ConfiguracoesRoutingModule,
    NgbModalModule,
    PageHeaderModule,
    NavigationModule,
];

@NgModule({
    imports: [
        ...IMPORTS,
    ],
    declarations: [
        ...ROUTED_COMPONENTS,
    ],
})
export class ConfiguracoesModule { }
