import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { PageHeaderModule } from '@modules/page-header/page-header.module';
import { SharedModule } from '@modules/shared/shared.module';
import { DashboardsRoutingModule } from './dashboards-routing.module';
import { DashboardsComponent } from './dashboards.component';
import { DashClienteComponent } from './dash-cliente/dash-cliente.component';
import  { DashboardsService } from './dashboards.service';
import { NgxChartsModule } from '@swimlane/ngx-charts';

const ROUTED_COMPONENTS = [
    DashboardsComponent,
    DashClienteComponent
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
    DashboardsRoutingModule,
    NgxChartsModule

];

const PROVIDERS = [
    DashboardsService
];


@NgModule({
    imports: [
        ...MODULES,
    ],
    declarations: [
        ...ROUTED_COMPONENTS,
    ],
    providers: [
        ...PROVIDERS,
    ]
})
export class DashboardsModule { }
