import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FluxoComponent } from './fluxo.component';

import * as components from './components';

const routes: Routes = [
    {
        path: '',
        component: FluxoComponent,
        children: [
            {
                path: 'fluxo-centro',
                component: components.FluxoCentroComponent,
                data: {
                    title: 'Sales - Fluxo Centro',
                },
            },
            {
                path: 'fluxo-tipo',
                component: components.FluxoTipoComponent,
                data: {
                    title: 'Sales - Fluxo Tipo',
                },
            },
            {
                path: 'fluxo-cliente',
                component: components.FluxoClienteComponent,
                data: {
                    title: 'Sales - Fluxo Cliente',
                },
            }
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
export class FluxoRoutingModule { }
