import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FornecedoresRoutingModule } from './fornecedores-routing.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import { FornecedoresComponent } from './fornecedores.component';
import { FornecedorGrupoComponent } from './fornecedor-grupo/fornecedor-grupo.component';
import { FornecedorComponent } from './fornecedor/fornecedor.component';
import { NgbTypeaheadModule, NgbNavModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AppFornecModalConfirmComponent } from './modals/app-fornec-modal-confirm/app-fornec-modal-confirm.component';
import { MomentModule } from 'ngx-moment';
import { AppResizeWatcherDirective } from './fornecedores.directive';
import { SharedModule } from '@modules/shared/shared.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { PageHeaderModule } from '@modules/page-header/page-header.module';
import { IconsModule } from '@modules/icons/icons.module';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

const IMPORTS = [
    CommonModule,
    FormsModule,
    NgbTypeaheadModule,
    NgbModalModule,
    NgbNavModule,
    MomentModule,
    NgxDatatableModule,
    NgxSpinnerModule,
    FornecedoresRoutingModule,
    SharedModule,
    NavigationModule,
    PageHeaderModule,
    SharedModule,
    IconsModule,
    NgxMaskDirective, NgxMaskPipe
];

const ROUTED_COMPONENTS = [
    AppResizeWatcherDirective,
    FornecedoresComponent,
    FornecedorGrupoComponent,
    FornecedorComponent,
    AppFornecModalConfirmComponent,
];

@NgModule({
    imports: [
        ...IMPORTS,
    ],
    declarations: [
        ...ROUTED_COMPONENTS,
    ],
    providers: [provideNgxMask()]
})
export class FornecedoresModule { }
