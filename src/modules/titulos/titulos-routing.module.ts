import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TitulosComponent } from './titulos.component';
import { TituloReceberComponent } from './titulo-receber/titulo-receber.component';
import { ChequeRecebidosComponent } from './cheques-recebidos/cheques-recebidos.component';
import { TituloTotvsComponent } from './titulo-totvs/titulo-totvs.component';
import { TitReceberLotComponent } from './tit-receber-lot/tit-receber-lot.component';
import { TituloCsvComponent } from './titulo-csv/titulo-csv.component';
import { GrupoDespesaComponent } from './grupo-despesa/grupo-despesa.component';
import { SubGrupoDespesaComponent } from './sub-grupo-despesa/sub-grupo-despesa.component';
import { TituloDespesaComponent } from './titulo-despesa/titulo-despesa.component';


const routes: Routes = [
    {
        path: '',
        component: TitulosComponent,
        children: [
            { path: 'titulo-receber', component: TituloReceberComponent },
            { path: 'cheque-recebido', component: ChequeRecebidosComponent },
            { path: 'tit-receber-totvs', component: TituloTotvsComponent },
            { path: 'tit-receber-lot', component: TitReceberLotComponent },
            { path: 'titulo-csv', component: TituloCsvComponent },
            { path: 'grupo-titulo-despesa', component: GrupoDespesaComponent },
            { path: 'sub-titulo-despesa', component: SubGrupoDespesaComponent },
            { path: 'titulo-despesa', component: TituloDespesaComponent },

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
export class TitulosRoutingModule { }
