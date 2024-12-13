import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FornecedoresComponent } from './fornecedores.component';
import { FornecedorGrupoComponent } from './fornecedor-grupo/fornecedor-grupo.component';
import { FornecedorComponent } from './fornecedor/fornecedor.component';

const routes: Routes = [
    {
        path: '',
        component: FornecedoresComponent,
        children: [
            { path: 'fornecedor-grupo', component: FornecedorGrupoComponent },
            {
                path: 'fornecedor-dto',
                data: {
                    title: 'Sales - Fornecedor',
                },
                component: FornecedorComponent
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
export class FornecedoresRoutingModule { }
