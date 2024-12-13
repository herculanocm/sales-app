import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfiguracoesComponent } from './configuracoes.component';
import { CondicaoPagamentoComponent } from './condicao-pagamento/condicao-pagamento.component';
import { ConfGeraisComponent } from './conf-gerais/conf-gerais.component';
import { ExecutorComponent } from './executor/executor.component';
import  { TwilioSMSComponent } from './sms/sms.component';
import { ConfMsgComponent } from './conf-msg/conf-msg.component';

const routes: Routes = [
    {
        path: '',
        component: ConfiguracoesComponent,
        children: [
            { path: 'conf-gerais-dto', component: ConfGeraisComponent },
            { path: 'condicao-pagamento', component: CondicaoPagamentoComponent },
            { path: 'executor', component: ExecutorComponent },
            { path: 'sms', component: TwilioSMSComponent },
            { path: 'conf-msg', component: ConfMsgComponent },
        ],
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    declarations: [],
    exports: [
        RouterModule,
    ],
})
export class ConfiguracoesRoutingModule { }
