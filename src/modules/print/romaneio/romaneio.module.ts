import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';
import { RomaneioPrintRoutingModule } from './romaneio-routing.module';
import { RomaneioPrintComponent } from './romaneio.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { RomaneioPrintService } from './romaneio.service';

const IMPORTS = [
    CommonModule,
    FormsModule,
    MomentModule,

    NgxSpinnerModule,

    RomaneioPrintRoutingModule,
];
const ROUTED_COMPONENTS = [
    RomaneioPrintComponent,
];

const PROVIDERS = [
    RomaneioPrintService,
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
export class RomaneioPrintModule { }
