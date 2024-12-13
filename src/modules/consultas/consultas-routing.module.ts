import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConsultasComponent } from './consultas.component';
import { ConsultaComponent } from './consulta/consulta.component';
import { RelatorioComponent } from './relatorio/relatorio.component';

const routes: Routes = [
    {
        path: '',
        component: ConsultasComponent,
        children: [
            { path: 'consulta-livre', component: ConsultaComponent },
            { path: 'relatorio', component: RelatorioComponent },
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
export class ConsultasRoutingModule { }
