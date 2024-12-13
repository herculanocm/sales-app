import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';
import { RomaneioHstPrintRoutingModule } from './romaneio-hst-routing.module';
import { RomaneioHstPrintComponent } from './romaneio-hst.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { RomaneioHstPrintService } from './romaneio-hst.service';

const IMPORTS = [
    CommonModule,
    FormsModule,
    MomentModule,

    NgxSpinnerModule,

    RomaneioHstPrintRoutingModule,
];
const ROUTED_COMPONENTS = [
    RomaneioHstPrintComponent,
];

const PROVIDERS = [
    RomaneioHstPrintService,
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
    ],
})
export class RomaneioHstPrintModule { }
