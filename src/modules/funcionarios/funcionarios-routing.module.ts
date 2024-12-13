import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FuncionariosComponent } from './funcionarios.component';
import { FuncionarioGrupoComponent } from './funcionario-grupo/funcionario-grupo.component';
import { FuncionarioComponent } from './funcionario/funcionario.component';

const routes: Routes = [
    {
        path: '',
        component: FuncionariosComponent,
        children: [
            { path: 'funcionario-grupo', component: FuncionarioGrupoComponent },
            {
                path: 'funcionario-dto',
                data: {
                    title: 'Sales - Funcionario',
                },
                component: FuncionarioComponent
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
export class FuncionariosRoutingModule { }
