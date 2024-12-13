import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';
import { PrintRotav1RomaneioRoutingModule } from './rota-v1-romaneio-routing.module';
import { PrintRotav1RomaneioComponent } from './rota-v1-romaneio.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { RotaV1RomaneioService } from './rota-v1-romaneio.service';

const IMPORTS = [
    CommonModule,
    FormsModule,
    MomentModule,

    NgxSpinnerModule,

    PrintRotav1RomaneioRoutingModule,
];
const ROUTED_COMPONENTS = [
    PrintRotav1RomaneioComponent,
];

const PROVIDERS = [
    RotaV1RomaneioService,
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
export class PrintRotav1RomaneioModule { }
