import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrintComponent } from './print.component';

const routes: Routes = [
    {
        path: '',
        component: PrintComponent,
        children: [
            {
                path: 'movimento/:id', loadChildren: () => import('./movimentos/print-movimento.module')
                    .then(m => m.PrintMovimentoModule)
            },
            {
                path: 'venda/:id', loadChildren: () => import('./vendas/print-venda.module')
                    .then(v => v.PrintVendaModule)
            },
            {
                path: 'vendas/:id', loadChildren: () => import('./vd/print-vd.module')
                    .then(v => v.PrintVdModule)
            },
            {
                path: 'venda2/:id', loadChildren: () => import('./vendas2/print-venda2.module')
                    .then(v => v.PrintVenda2Module)
            },
            {
                path: 'rota-v1-romaneio/:id', loadChildren: () => import('./rota-v1-romaneio/rota-v1-romaneio.module')
                    .then(r => r.PrintRotav1RomaneioModule)
            },
            {
                path: 'romaneio/:id', loadChildren: () => import('./romaneio/romaneio.module')
                    .then(r => r.RomaneioPrintModule)
            },
            {
                path: 'romaneio-historico/:id', loadChildren: () => import('./romaneio-hst/romaneio-hst.module')
                .then(rh => rh.RomaneioHstPrintModule)
            },
            {
                path: 'caixa/:id', loadChildren: () => import('./caixa/caixa.module')
                .then(cx => cx.CaixaPrintModule)
            },
            {
                path: 'cheque/:id', loadChildren: () => import('./cheque/cheque.module')
                .then(cx => cx.ChequePrintModule)
            },
            {
                path: 'vd-print/:id', loadChildren: () => import('./vdprint/vdprint.module')
                    .then(v => v.VdPrintModule)
            },
            {
                path: 'fluxo-cliente-sintetico/:id', loadChildren: () => import('./fluxo-cliente-sintetico/fluxo-cliente-sintetico.module')
                    .then(v => v.FluxoClienteSinteticoPrintModule)
            }
        ],
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PrintRoutingModule { }
