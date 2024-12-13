import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VeiculoComponent } from './veiculo/veiculo.component';
import { VeiculosComponent } from './veiculos.component';

const routes: Routes = [
    {
        path: '',
        component: VeiculosComponent,
        children: [
            { path: 'veiculo', component: VeiculoComponent },
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
export class AcessosRoutingModule { }
