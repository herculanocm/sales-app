import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RomaneioHstPrintComponent } from './romaneio-hst.component';


const routes: Routes = [
    {
        path: '',
        component: RomaneioHstPrintComponent,
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
export class RomaneioHstPrintRoutingModule { }
