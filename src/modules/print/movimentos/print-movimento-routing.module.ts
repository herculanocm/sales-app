import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrintMovimentoComponent } from './print-movimento.component';

const routes: Routes = [
    {
        path: '',
        component: PrintMovimentoComponent,
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
export class PrintMovimentoRoutingModule { }
