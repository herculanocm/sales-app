import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChequePrintComponent } from './cheque.component';


const routes: Routes = [
    {
        path: '',
        component: ChequePrintComponent,
    }
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
export class ChequePrintRoutingModule { }
