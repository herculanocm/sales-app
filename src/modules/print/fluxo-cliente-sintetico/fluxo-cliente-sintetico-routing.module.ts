import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FluxoClienteSinteticoPrintComponent } from './fluxo-cliente-sintetico.component';


const routes: Routes = [
    {
        path: '',
        component: FluxoClienteSinteticoPrintComponent,
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
export class FluxoClienteSinteticoPrintRoutingModule { }
