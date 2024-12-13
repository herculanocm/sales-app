/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { environment } from 'environments/environment';
/* Module */
import { PagesModule } from './pages.module';

/* Containers */
import * as pagesComponents from './components';
import { RouteData } from '@modules/navigation/models';


export const ROUTES: Routes = [
    {
        path: '',
        canActivate: [],
        component: pagesComponents.PagesComponent,
        children: [
            {
                path: '',
                data: {
                    title: `${environment.TITLE_APP_NAME} - Home`,
                    breadcrumbs: [
                        {
                            text: 'Home',
                            active: true,
                        },
                    ],
                },
                component: pagesComponents.HomeComponent,
            },
            {
                path: 'profile',
                canActivate: [],
                component: pagesComponents.ProfileComponent,
                data: {
                    title: `${environment.TITLE_APP_NAME} - Profile`,
                } as RouteData,
            },
            {
                path: 'dashboards',
                loadChildren: () => import('modules/dashboards/dashboards.module')
                    .then(dash => dash.DashboardsModule),
            },
            {
                path: 'fornecedores',
                loadChildren: () => import('modules/fornecedores/fornecedores.module')
                    .then(fornec => fornec.FornecedoresModule),
            },
            {
                path: 'funcionarios',
                loadChildren: () => import('modules/funcionarios/funcionarios.module')
                    .then(fornec => fornec.FuncionariosModule),
            },
            {
                path: 'acessos',
                loadChildren: () => import('modules/acessos/acessos.module')
                    .then(a => a.AcessosModule),
            },
            {
                path: 'configuracoes',
                loadChildren: () => import('modules/configuracoes/configuracoes.module')
                    .then(cf => cf.ConfiguracoesModule),
            },
            {
                path: 'estoques',
                loadChildren: () => import('modules/estoques/estoques.module')
                    .then(et => et.EstoquesModule),
            },
            {
                path: 'veiculos',
                loadChildren: () => import('modules/veiculos/veiculos.module')
                    .then(vei => vei.VeiculosModule),
            },
            {
                path: 'itens',
                loadChildren: () => import('modules/itens/itens.module')
                    .then(ite => ite.ItensModule),
            },
            {
                path: 'clientes',
                loadChildren: () => import('modules/clientes/clientes.module')
                    .then(cli => cli.ClientesModule),
            },
            {
                path: 'movimentos',
                loadChildren: () => import('modules/movimentos/movimentos.module')
                    .then(mov => mov.MovimentosModule),
            },
            {
                path: 'vendas',
                loadChildren: () => import('modules/vendas/vendas.module')
                    .then(mov => mov.VendasModule),
            },
            {
                path: 'titulos',
                loadChildren: () => import('modules/titulos/titulos.module')
                    .then(t => t.TitulosModule),
            },
            {
                path: 'consultas',
                loadChildren: () => import('modules/consultas/consultas.module')
                    .then(cl => cl.ConsultasModule),
            },
            {
                path: 'totvs',
                loadChildren: () => import('modules/totvs/totvs.module')
                    .then(mp => mp.TotvsModule),
            },
            {
                path: 'fluxos',
                loadChildren: () => import('modules/fluxo/fluxo.module')
                    .then(mp => mp.FluxoModule),
            },
        ],
    },
];

@NgModule({
    imports: [PagesModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class PagesRoutingModule {}
