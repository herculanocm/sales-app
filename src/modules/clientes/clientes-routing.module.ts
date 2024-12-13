import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClientesComponent } from './clientes.component';
import { ClienteGrupoComponent } from './cliente-grupo/cliente-grupo.component';
import { ClienteCategoriaComponent } from './cliente-categoria/cliente-categoria.component';
import { ClienteComponent } from './cliente/cliente.component';
import { ClienteStatusLabelComponent } from './cliente-status-label/cliente-status-label.component';
import { SetorComponent } from './cliente-setor/setor.component';
import { ComodatoComponent } from './comodato/comodato.component';

const routes: Routes = [
    {
        path: '',
        component: ClientesComponent,
        children: [
            { path: 'cliente-grupo', component: ClienteGrupoComponent },
            { path: 'cliente-categoria', component: ClienteCategoriaComponent },
            { path: 'cliente-setor', component: SetorComponent },
            { path: 'cliente-status-label', component: ClienteStatusLabelComponent },
            {
                path: 'cliente-dto',
                data: {
                    title: 'Sales - Cliente',
                },
                component: ClienteComponent
            },
            { path: 'cliente-comodato', component: ComodatoComponent },
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
export class ClientesRoutingModule { }
