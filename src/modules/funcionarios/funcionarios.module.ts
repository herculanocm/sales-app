import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuncionariosRoutingModule } from './funcionarios-routing.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MomentModule } from 'ngx-moment';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import { FuncionariosComponent } from './funcionarios.component';
import { FuncionarioGrupoComponent } from './funcionario-grupo/funcionario-grupo.component';
import { FuncionarioComponent } from './funcionario/funcionario.component';
import { NgbTypeaheadModule,
    NgbAccordionModule,
    NgbModalModule,
    NgbTooltipModule,
    NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { AppFuncModalConfirmComponent } from './modals/app-func-modal-confirm/app-func-modal-confirm.component';
import { AppResizeWatcherDirective } from './funcionarios.directives';
import { SharedModule } from '@modules/shared/shared.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { PageHeaderModule } from '@modules/page-header/page-header.module';
import { IconsModule } from '@modules/icons/icons.module';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';

const IMPORTS = [
    CommonModule,
    FormsModule,
    NgbTypeaheadModule,
    NgbNavModule,
    NgbAccordionModule,
    NgbTooltipModule,
    NgbModalModule,
    PageHeaderModule,
    SharedModule,
    NavigationModule,
    NgxDatatableModule,
    MomentModule,
    NgxSpinnerModule,
    FuncionariosRoutingModule,
    SharedModule,
    IconsModule,
    NgxMaskDirective, NgxMaskPipe
];

const ROUTED_COMPONENTS = [
    AppResizeWatcherDirective,
    FuncionariosComponent,
    FuncionarioGrupoComponent,
    FuncionarioComponent,
    AppFuncModalConfirmComponent,
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
export class FuncionariosModule { }
