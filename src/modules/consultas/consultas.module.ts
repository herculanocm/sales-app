import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    NgbModalModule,
    NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { ConsultasRoutingModule } from './consultas-routing.module';
import { AppResizeWatcherDirective } from './consultas.directives';
import { ConsultasComponent } from './consultas.component';
import { ConsultaComponent } from './consulta/consulta.component';
import { AppConsultaModalAlertComponent } from './modals/app-consulta-modal-alert/app-consulta-modal-alert.component';
import { AppConsultaModalConfirmComponent } from './modals/app-consulta-modal-confirm/app-consulta-modal-confirm.component';
import { ConsultaService } from './consulta/consulta.service';
import { RelatorioComponent } from './relatorio/relatorio.component';
import { RelatorioService } from './relatorio/relatorio.service';
import { SharedModule } from '@modules/shared/shared.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { PageHeaderModule } from '@modules/page-header/page-header.module';

const IMPORTS = [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    NgbModalModule,
    NgbTooltipModule,

    PageHeaderModule,
    SharedModule,

    NgxSpinnerModule,

    ConsultasRoutingModule,

    NavigationModule,
];

const ROUTED_COMPONENTS = [
    ConsultasComponent,
    ConsultaComponent,
    RelatorioComponent,

    AppResizeWatcherDirective,

    AppConsultaModalAlertComponent,
    AppConsultaModalConfirmComponent,
];

const ENTRY_COMPONENTS = [
    AppConsultaModalAlertComponent,
    AppConsultaModalConfirmComponent,
];

const PROVIDERS = [
    ConsultaService,
    RelatorioService,
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
export class ConsultasModule { }
