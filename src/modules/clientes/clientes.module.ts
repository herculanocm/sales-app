import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientesRoutingModule } from './clientes-routing.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxCurrencyDirective } from 'ngx-currency';
import { MomentModule } from 'ngx-moment';
import { ConfiguracoesModule } from '../configuracoes/configuracoes.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    NgbTypeaheadModule,
    NgbAccordionModule,
    NgbCarouselModule,
    NgbTooltipModule,
    NgbModalModule,
    NgbNavModule
} from '@ng-bootstrap/ng-bootstrap';
import { ClientesComponent } from './clientes.component';
import { ClienteGrupoComponent } from './cliente-grupo/cliente-grupo.component';
import { ClienteCategoriaComponent } from './cliente-categoria/cliente-categoria.component';
import { SetorComponent } from './cliente-setor/setor.component';
import { ClienteStatusLabelComponent } from './cliente-status-label/cliente-status-label.component';
import { ClienteStatusLabelFilter } from './clientes-status.pipes';
import { ClienteComponent } from './cliente/cliente.component';
import { AppClienteModalConfirmComponent } from './modals/app-cliente-modal-confirm/app-cliente-modal-confirm.component';
import { AppResizeWatcherDirective } from './clientes.directives';
import { ComodatoComponent } from './comodato/comodato.component';
import { SharedModule } from '@modules/shared/shared.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { PageHeaderModule } from '@modules/page-header/page-header.module';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { IconsModule } from '@modules/icons/icons.module';

const ROUTED_COMPONENTS = [
    AppResizeWatcherDirective,
    ClientesComponent,
    ClienteGrupoComponent,
    ClienteCategoriaComponent,
    SetorComponent,
    ClienteStatusLabelComponent,
    ClienteComponent,
    ClienteStatusLabelFilter,
    AppClienteModalConfirmComponent,
    ComodatoComponent,
];


const MODULES = [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbTypeaheadModule,
    NgbAccordionModule,
    NgbCarouselModule,
    NgbTooltipModule,
    NgbNavModule,
    NgbModalModule,

    PageHeaderModule,
    SharedModule,

    NgxDatatableModule,
    NgxCurrencyDirective,
    MomentModule,
    ConfiguracoesModule,
    NgxSpinnerModule,

    ClientesRoutingModule,

    NavigationModule,
    PageHeaderModule,
    NgxMaskDirective, 
    NgxMaskPipe,
    SharedModule,
    IconsModule,
];

@NgModule({
    imports: [
        ...MODULES,
    ],
    declarations: [
        ...ROUTED_COMPONENTS,
    ],
    providers: [
        provideNgxMask()
    ]
})
export class ClientesModule { }
