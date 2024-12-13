import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstoquesRoutingModule } from './estoques-routing.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MomentModule } from 'ngx-moment';
import { EstoqueAlmoxarifadoService } from './estoque-almoxarifado/estoque-almoxarifado.service';
import { FormsModule } from '@angular/forms';
import { EstoquesComponent } from './estoques.component';
import { EstoqueAlmoxarifadoComponent } from './estoque-almoxarifado/estoque-almoxarifado.component';
import { AppEstoqueModalConfirmComponent } from './modals/app-estoque-modal-confirm/app-estoque-modal-confirm.component';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@modules/shared/shared.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { PageHeaderModule } from '@modules/page-header/page-header.module';
import { NgxSpinnerModule } from 'ngx-spinner';


const ROUTED_COMPONENTS = [
    EstoquesComponent,
    EstoqueAlmoxarifadoComponent,
    AppEstoqueModalConfirmComponent,
];

const IMPORTS = [
    CommonModule,
    FormsModule,

    NgbModalModule,
    PageHeaderModule,
    NavigationModule,
    NgxDatatableModule,
    PageHeaderModule,
    MomentModule,
    SharedModule,
    NgxSpinnerModule,
    EstoquesRoutingModule,
];

const PROVIDERS = [
    EstoqueAlmoxarifadoService,
];

@NgModule({
    imports: [
        ...IMPORTS,
    ],
    declarations: [
        ...ROUTED_COMPONENTS,
    ],
    providers: [
        ...PROVIDERS,
    ]
})
export class EstoquesModule { }
