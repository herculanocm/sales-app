import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VdPrintComponent } from './vdprint.component';

const routes: Routes = [
    {
        path: '',
        component: VdPrintComponent,
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
export class VdPrintRoutingModule { }
