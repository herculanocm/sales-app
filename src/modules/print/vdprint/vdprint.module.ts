import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VdPrintComponent } from './vdprint.component';
import { VdPrintRoutingModule } from './vdprint-routing.module';
import { FormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';
import { VdPrintService } from './vdprint.service';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { SharedModule } from '@modules/shared/shared.module';

const IMPORTS = [
    CommonModule,
    FormsModule,
    SharedModule,
    MomentModule,
    VdPrintRoutingModule,
    NgxMaskDirective, NgxMaskPipe
];
const ROUTED_COMPONENTS = [
    VdPrintComponent,
];
const PROVIDERS = [
    VdPrintService,
    provideNgxMask(),
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
export class VdPrintModule { }
