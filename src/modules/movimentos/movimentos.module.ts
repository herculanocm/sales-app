import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovimentosRoutingModule } from './movimentos-routing.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxCurrencyDirective } from 'ngx-currency';
import { MomentModule } from 'ngx-moment';

import { VeiculosModule } from '../veiculos/veiculos.module';
import { ItensModule } from '../itens/itens.module';
import { ClientesModule } from '../clientes/clientes.module';
import { FornecedoresModule } from '../fornecedores/fornecedores.module';
import { FuncionariosModule } from '../funcionarios/funcionarios.module';
import { EstoquesModule } from '../estoques/estoques.module';
import { AcessosModule } from '../acessos/acessos.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MovimentosComponent } from './movimentos.component';
import { MovimentoTipoComponent } from './movimento-tipo/movimento-tipo.component';
import { MovimentoComponent } from './movimento/movimento.component'
import { MovComponent } from './mov/mov.component';
import { MovimentoSimplesComponent } from './movimento-simples/movimento-simples.component';
import { MovimentoTransfComponent } from './movimento-transf/movimento-transf.component';
import { MovimentoPosicaoItemComponent } from './movimento-posicao-item/movimento-posicao-item.component';
import { AppMovimentoModalConfirmComponent } from './modals/app-mov-modal-confirm/app-mov-modal-confirm.component';
import {
    NgbTypeaheadModule,
    NgbAccordionModule,
    NgbCarouselModule,
    NgbTooltipModule,
    NgbModalModule
} from '@ng-bootstrap/ng-bootstrap';
import { MovimentoItemAuditoriaComponent } from './movimento-auditoria/movimento-auditoria.component';
import { MovimentoPrecoItemComponent } from './movimento-preco-item/movimento-preco-item.component';
import { AppResizeWatcherDirective } from './movimentos.directive';
import { MovimentoCheckAlxsComponent } from './movimento-check-alxs/movimento-check-alxs.component';
import { AjusteMediasComponent } from './ajuste-medias/ajuste-medias.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from '@modules/shared/shared.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { PageHeaderModule } from '@modules/page-header/page-header.module';
import { IconsModule } from '@modules/icons/icons.module';
import { ItemConfirmModalComponent } from './modals/item-confirm-modal.component';
import { ModalFindMovimentoComponent } from './modals/modal-find-movimento/modal-find-movimento.component';

const IMPORTS = [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbTypeaheadModule,
    NgbAccordionModule,
    NgbCarouselModule,
    NgbTooltipModule,
    NgbModalModule,

    NgxDatatableModule,
    NgxCurrencyDirective,
    MomentModule,
    NgxSpinnerModule,
    NgSelectModule,

    PageHeaderModule,
    SharedModule,
    IconsModule,
  

    VeiculosModule,
    ItensModule,
    ClientesModule,
    FornecedoresModule,
    FuncionariosModule,
    EstoquesModule,
    AcessosModule,

    MovimentosRoutingModule,

    NavigationModule,
];

const ROUTED_COMPONENTS = [
    MovimentosComponent,
    AppResizeWatcherDirective,
    MovimentoTipoComponent,
    MovimentoComponent,
    MovComponent,
    MovimentoSimplesComponent,
    MovimentoTransfComponent,
    MovimentoPosicaoItemComponent,
    MovimentoPrecoItemComponent,
    MovimentoItemAuditoriaComponent,
    AppMovimentoModalConfirmComponent,
    MovimentoCheckAlxsComponent,
    AjusteMediasComponent,
    ItemConfirmModalComponent,
    ModalFindMovimentoComponent
];

@NgModule({
    imports: [
        ...IMPORTS,
    ],
    declarations: [
        ...ROUTED_COMPONENTS,
    ],
})
export class MovimentosModule { }
