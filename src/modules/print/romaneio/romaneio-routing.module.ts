import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RomaneioPrintComponent } from './romaneio.component';


const routes: Routes = [
    {
        path: '',
        component: RomaneioPrintComponent,
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
export class RomaneioPrintRoutingModule { }
