import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AcessosComponent } from './acessos.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { RolesComponent } from './roles/roles.component';
import { ControleRelatorioComponent } from './controle-relatorio/controle-relatorio.component';

const routes: Routes = [
    {
        path: '',
        component: AcessosComponent,
        children: [
            { path: 'usuarios', component: UsuariosComponent },
            { path: 'roles', component: RolesComponent },
            { path: 'access-report', component: ControleRelatorioComponent },
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
export class AcessosRoutingModule { }
