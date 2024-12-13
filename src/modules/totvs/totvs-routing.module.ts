import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TotvsClienteComponent } from './totvs-cliente/totvs-cliente.component';
import { TotvsCondicaoComponent } from './totvs-condicao/totvs-condicao.component';
import { TotvsItemComponent } from './totvs-item/totvs-item.component';
import { TotvsVendaComponent } from './totvs-venda/totvs-venda.component';
import { TotvsComponent } from './totvs.component';
import { TotvsPrecoComponent } from './totvs-preco/totvs-preco.component';


const routes: Routes = [
    {
        path: '',
        component: TotvsComponent,
        children: [
            { path: 'integracao-clientes', component: TotvsClienteComponent },
            { path: 'integracao-itens', component: TotvsItemComponent },
            { path: 'integracao-condicoes', component: TotvsCondicaoComponent },
            { path: 'integracao-vendas', component: TotvsVendaComponent },
            { path: 'integracao-preco', component: TotvsPrecoComponent }
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
export class TotvsRoutingModule { }
