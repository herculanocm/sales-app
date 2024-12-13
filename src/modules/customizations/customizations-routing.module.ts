
/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { CustomizationsModule } from './customizations.module';

import * as customizationsComponents from './components';
import { RouteData } from '@modules/navigation/models';
import { environment } from 'environments/environment';

/* Routes */
export const ROUTES: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'menus',
    },
    {
        path: 'menus',
        canActivate: [],
        component: customizationsComponents.MenusComponent,
        data: {
            title: `${environment.TITLE_APP_NAME} - Menu`,
        } as RouteData,
    },
    {
        path: 'reports',
        canActivate: [],
        component: customizationsComponents.ReportsComponent,
        data: {
            title: `${environment.TITLE_APP_NAME} - Relatórios`,
        } as RouteData,
    },
    {
        path: 'groups',
        canActivate: [],
        component: customizationsComponents.GroupsComponent,
        data: {
            title: `${environment.TITLE_APP_NAME} - Grupo`,
        } as RouteData,
    }
];

@NgModule({
    imports: [CustomizationsModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class CustomizationsRoutingModule {}
