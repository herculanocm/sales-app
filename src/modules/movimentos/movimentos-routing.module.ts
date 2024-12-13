import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MovimentosComponent } from './movimentos.component';
import { MovimentoTipoComponent } from './movimento-tipo/movimento-tipo.component';
import { MovimentoComponent } from './movimento/movimento.component';
import { MovimentoSimplesComponent } from './movimento-simples/movimento-simples.component';
import { MovimentoTransfComponent } from './movimento-transf/movimento-transf.component';
import { MovimentoPosicaoItemComponent } from './movimento-posicao-item/movimento-posicao-item.component';
import { MovimentoItemAuditoriaComponent } from './movimento-auditoria/movimento-auditoria.component';
import { MovimentoPrecoItemComponent } from './movimento-preco-item/movimento-preco-item.component';
import { MovimentoCheckAlxsComponent } from './movimento-check-alxs/movimento-check-alxs.component';
import { AjusteMediasComponent } from './ajuste-medias/ajuste-medias.component';
import { MovComponent } from './mov/mov.component';

const routes: Routes = [
    {
        path: '',
        component: MovimentosComponent,
        children: [
            { path: 'movimento-tipo', component: MovimentoTipoComponent },
            { path: 'movimento-dto', component: MovimentoComponent },
            { path: 'movimento', component: MovComponent },
            { path: 'movimento-simples', component: MovimentoSimplesComponent },
            { path: 'movimento-transferencia', component: MovimentoTransfComponent },
            { path: 'movimento-posicao-item', component: MovimentoPosicaoItemComponent },
            { path: 'movimento-auditoria', component: MovimentoItemAuditoriaComponent },
            { path: 'movimento-preco-item', component: MovimentoPrecoItemComponent },
            { path: 'movimento-check-alxs', component: MovimentoCheckAlxsComponent },
            { path: 'ajuste-medias', component: AjusteMediasComponent },
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
export class MovimentosRoutingModule { }
