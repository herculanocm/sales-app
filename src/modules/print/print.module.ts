import { NgModule } from '@angular/core';
import { PrintRoutingModule } from './print-routing.module';
import { PrintComponent } from './print.component';
import { PrintService } from './print.service';

const IMPORTS = [
  PrintRoutingModule,
];

const DECLARATIONS = [
  PrintComponent,
];

const PROVIDERS = [
  PrintService,
];

@NgModule({
  imports: [
    ...IMPORTS,
  ],
  declarations: [
    ...DECLARATIONS,
  ],
  providers: [
    ...PROVIDERS,
],
})
export class PrintModule { }
