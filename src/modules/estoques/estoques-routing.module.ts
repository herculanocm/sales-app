import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EstoquesComponent } from './estoques.component';
import { EstoqueAlmoxarifadoComponent } from './estoque-almoxarifado/estoque-almoxarifado.component';

const routes: Routes = [
    {
        path: '',
        component: EstoquesComponent,
        children: [
            { path: 'estoque-almoxarifado', component: EstoqueAlmoxarifadoComponent },
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
export class EstoquesRoutingModule { }
