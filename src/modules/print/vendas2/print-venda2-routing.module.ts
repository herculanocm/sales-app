import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrintVenda2Component } from './print-venda2.component';

const routes: Routes = [
    {
        path: '',
        component: PrintVenda2Component,
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
export class PrintVenda2RoutingModule { }
