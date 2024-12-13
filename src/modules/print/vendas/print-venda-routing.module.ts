import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrintVendaComponent } from './print-venda.component';

const routes: Routes = [
    {
        path: '',
        component: PrintVendaComponent,
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    declarations: [],
    exports: [
        RouterModule,
    ],
})
export class PrintVendaRoutingModule { }
