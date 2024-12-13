import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AcessosRoutingModule } from './acessos-routing.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AcessosComponent } from './acessos.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { NgbModalModule, NgbModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AppAcessosModalConfirmComponent } from './modals/app-acessos-modal-confirm/app-acessos-modal-confirm.component';
import { RolesComponent } from './roles/roles.component';
import { RolesService } from './roles/roles.service';
import { AppAcessosModalCloneComponent } from './modals/app-acessos-modal-clone/app-acessos-modal-clone.component';
import { AppResizeWatcherDirective } from './acessos.directives';
import { ControleRelatorioComponent } from './controle-relatorio/controle-relatorio.component';
import { ControleRelatorioService } from './controle-relatorio/controle-relatorio.service';
import { SharedModule } from '@modules/shared/shared.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { PageHeaderModule } from '@modules/page-header/page-header.module';
import { IconsModule } from '@modules/icons/icons.module';

const ROUTED_COMPONENTS = [
    AppResizeWatcherDirective,
    AcessosComponent,
    UsuariosComponent,
    RolesComponent,
    ControleRelatorioComponent,
    AppAcessosModalConfirmComponent,
    AppAcessosModalCloneComponent,
];

const IMPORTS = [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbTooltipModule,
    NgbModalModule,
    SharedModule,
    NgxDatatableModule,
    NgxSpinnerModule,
    PageHeaderModule,
    NgbModule,
    AcessosRoutingModule,
    PageHeaderModule,
    NavigationModule,
    IconsModule,
];

const PROVIDERS = [
    RolesService,
    ControleRelatorioService,
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
export class AcessosModule { }
