import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrintRotav1RomaneioComponent } from './rota-v1-romaneio.component';


const routes: Routes = [
    {
        path: '',
        component: PrintRotav1RomaneioComponent,
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
export class PrintRotav1RomaneioRoutingModule { }
