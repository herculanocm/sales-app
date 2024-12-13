import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ItensComponent } from './itens.component';
import { UnidadeComponent } from './item-unidade/unidade.component';
import { MarcaComponent } from './item-marca/marca.component';
import { ItemComponent } from './item/item.component';
import { ItemGrupoComponent } from './item-grupo/grupo.component';
import { ItemCategoriaComponent } from './item-categoria/categoria.component';
import { ItemSubCategoriaComponent } from './item-sub-categoria/subcategoria.component';
import { ITPrecoComponent } from './item-preco/item-preco.component';
import { ItemRuaComponent } from './item-rua/rua.component';
import { ItemPredioComponent } from './item-predio/predio.component';
import { ItemNivelComponent } from './item-nivel/nivel.component';
import { ItemSeparadorComponent } from './item-separador/separador.component';
import { PrecificacaoAutoComponent } from './precificacao-auto/precificacao-auto.component';

const routes: Routes = [
    {
        path: '',
        component: ItensComponent,
        children: [
            { path: 'item-unidade', component: UnidadeComponent },
            { path: 'item-marca', component: MarcaComponent },
            { path: 'item-grupo', component: ItemGrupoComponent },
            { path: 'item-categoria', component: ItemCategoriaComponent },
            { path: 'item-subcategoria', component: ItemSubCategoriaComponent },
            { path: 'item-rua', component: ItemRuaComponent },
            { path: 'item-predio', component: ItemPredioComponent },
            { path: 'item-nivel', component: ItemNivelComponent },
            { path: 'item-separador', component: ItemSeparadorComponent },
            { path: 'item-precificacao-auto', component: PrecificacaoAutoComponent },
            {
                path: 'item-dto',
                data: {
                    title: 'Sales - Item',
                },
                component: ItemComponent
            },
            { path: 'item-preco', component: ITPrecoComponent },
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
export class ItensRoutingModule { }
