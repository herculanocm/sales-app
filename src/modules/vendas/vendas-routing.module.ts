import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VendasComponent } from './vendas.component';
import { VendaRepreComponent } from './venda-repre/venda-repre.component';
import { ReportRepreComponent } from './report-repre/report-repre.component';
import { ReportItensComponent } from './report-itens/report-itens.component';
import { VendaDectivateService } from './venda-deactivate.service';
import { ReportGrupoComponent } from './report-grupo/report-grupo.component';
import { VendaAprovaComponent } from './venda-aprova/venda-aprova.component';
import { VendaRotaComponent } from './venda-rota/venda-rota.component';
import { RomaneioComponent } from './romaneio/romaneio.component';
import { CaixaComponent } from './caixa/caixa.component';
import { VendaComponent } from './venda/venda.component';
import { PdvComponent } from './pdv/pdv.component';
import { PlanilhaReportComponent } from './planilha-report/planilha-report.component';
import { ReportVendaComponent } from './report-venda/report-venda.component';

const routes: Routes = [
    {
        path: '',
        component: VendasComponent,
        children: [
            { 
                path: 'venda', 
                component: VendaComponent, 
                data: {
                    title: 'Sales - Venda',
                },
                canDeactivate: [VendaDectivateService] 
            },
            { 
                path: 'pdv', 
                component: PdvComponent, 
                data: {
                    title: 'Sales - PDV',
                },
            },
            {
                path: 'romaneio', 
                data: {
                    title: 'Sales - Romaneio',
                },
                component: RomaneioComponent
            },
            { 
                path: 'report-representante',
                data: {
                    title: 'Sales - Report Representante',
                },
                component: ReportRepreComponent
            },
            { 
                path: 'relatorio-planilha',
                data: {
                    title: 'Sales - Relatório Planilha',
                },
                component: PlanilhaReportComponent
            },
            {
                path: 'venda-representante',
                data: {
                    title: 'Sales - Vendas Report',
                },
                component: VendaRepreComponent
            },
            {
                path: 'report-itens',
                data: {
                    title: 'Sales - Itens Report',
                },
                component: ReportItensComponent
            },
            {
                path: 'report-grupos',
                data: {
                    title: 'Sales - Report Grupos',
                },
                component: ReportGrupoComponent
            },
            {
                path: 'venda-aprovar',
                data: {
                    title: 'Sales - Aprovar Vendas',
                },
                component: VendaAprovaComponent
            },
            {
                path: 'venda-rota',
                data: {
                    title: 'Sales - Venda Rota',
                },
                component: VendaRotaComponent
            },
            {
                path: 'caixa',
                data: {
                    title: 'Sales - Caixa',
                },
                component: CaixaComponent
            },
            {
                path: 'report-venda',
                data: {
                    title: 'Sales - Report Venda',
                },
                component: ReportVendaComponent
            },
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
export class VendasRoutingModule { }
