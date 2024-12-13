import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardsComponent } from './dashboards.component';
import { DashClienteComponent } from './dash-cliente/dash-cliente.component';

const routes: Routes = [
    {
        path: '',
        component: DashboardsComponent,
        children: [
            { path: 'clientes', component: DashClienteComponent },
        ],
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [
        RouterModule,
    ],
})
export class DashboardsRoutingModule { }
