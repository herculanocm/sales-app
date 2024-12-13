import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CaixaPrintComponent } from './caixa.component';


const routes: Routes = [
    {
        path: '',
        component: CaixaPrintComponent,
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
export class CaixaPrintRoutingModule { }
