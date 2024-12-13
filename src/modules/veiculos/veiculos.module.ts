import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AcessosRoutingModule } from './veiculos-routing.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { VeiculoService } from './veiculo/veiculo.service';
import { FormsModule } from '@angular/forms';
import { VeiculosComponent } from './veiculos.component';
import { VeiculoComponent } from './veiculo/veiculo.component';
import { AppVeiculoModalConfirmComponent } from './modals/app-veiculo-modal-confirm/app-veiculo-modal-confirm.component';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AppResizeWatcherDirective } from './veiculos.directive';
import { SharedModule } from '@modules/shared/shared.module';
import { NavigationModule } from '@modules/navigation/navigation.module';
import { PageHeaderModule } from '@modules/page-header/page-header.module';
import { NgxSpinnerModule } from 'ngx-spinner';

const IMPORTS = [
    CommonModule,
    FormsModule,
    NgbModalModule,
    PageHeaderModule,
    SharedModule,
    NgxDatatableModule,
    AcessosRoutingModule,
    PageHeaderModule,
    NavigationModule,
    NgxSpinnerModule,
];

const ROUTED_COMPONENTS = [
    AppResizeWatcherDirective,
    VeiculosComponent,
    VeiculoComponent,
    AppVeiculoModalConfirmComponent,
];

const PROVIDERS = [
    VeiculoService,
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
export class VeiculosModule { }
