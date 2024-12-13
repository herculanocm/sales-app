import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItensRoutingModule } from './itens-routing.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxCurrencyDirective } from 'ngx-currency';
import { MomentModule } from 'ngx-moment';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    NgbTypeaheadModule,
    NgbNavModule,
    NgbAccordionModule,
    NgbCarouselModule,
    NgbTooltipModule,
    NgbModalModule
} from '@ng-bootstrap/ng-bootstrap';
import { ItensComponent } from './itens.component';
import { UnidadeComponent } from './item-unidade/unidade.component';
import { MarcaComponent } from './item-marca/marca.component';
import { ItemGrupoComponent } from './item-grupo/grupo.component';
import { ItemCategoriaComponent } from './item-categoria/categoria.component';
import { ItemSubCategoriaComponent } from './item-sub-categoria/subcategoria.component';
import { ItemComponent } from './item/item.component';
import { AppItensModalConfirmComponent } from './modals/app-itens-modal-confirm/app-itens-modal-confirm.component';
import { AppResizeWatcherDirective } from './itens.directive';
import { ITPrecoComponent } from './item-preco/item-preco.component';
import { EstoquesModule } from '../estoques/estoques.module';
import { SharedModule } from '@modules/shared/shared.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { PageHeaderModule } from '@modules/page-header/page-header.module';
import { ItemRuaComponent } from './item-rua/rua.component';
import { ItemPredioComponent } from './item-predio/predio.component';
import { ItemNivelComponent } from './item-nivel/nivel.component';
import { ItemSeparadorComponent } from './item-separador/separador.component';
import { IconsModule } from '@modules/icons/icons.module';
import { PrecificacaoAutoComponent } from './precificacao-auto/precificacao-auto.component';
import { ItemFornecedorPadraoModalComponent } from './modals/item-fornecedor/item-fornecedor.component';

const IMPORTS = [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    NgxSpinnerModule,
    NgbTypeaheadModule,
    NgbNavModule,
    NgbAccordionModule,
    NgbCarouselModule,
    NgbTooltipModule,
    NgbModalModule,

    PageHeaderModule,
    SharedModule,
    NgxDatatableModule,
    NgxCurrencyDirective,
    MomentModule,
    EstoquesModule,

    ItensRoutingModule,

    NavigationModule,
    PageHeaderModule,
    IconsModule,
];

const ROUTED_COMPONENTS = [
    AppResizeWatcherDirective,
    AppItensModalConfirmComponent,
    ItensComponent,
    UnidadeComponent,
    MarcaComponent,
    ItemGrupoComponent,
    ItemCategoriaComponent,
    ItemSubCategoriaComponent,
    ItemComponent,
    ItemRuaComponent,
    ItemRuaComponent,
    ItemPredioComponent,
    ItemNivelComponent,
    ItemSeparadorComponent,
    ITPrecoComponent,
    PrecificacaoAutoComponent,
    ItemFornecedorPadraoModalComponent
];


@NgModule({
    imports: [
        ...IMPORTS,
    ],
    declarations: [
        ...ROUTED_COMPONENTS,
    ],
})
export class ItensModule { }
