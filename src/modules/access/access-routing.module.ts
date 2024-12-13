
/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { AccessModule } from './access.module';

import * as accessComponents from './components';
import { RouteData } from '@modules/navigation/models';
import { environment } from 'environments/environment';


/* Routes */
export const ROUTES: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'user',
    },
    {
        path: 'user',
        canActivate: [],
        component: accessComponents.CreateUserComponent,
        data: {
            title: `${environment.TITLE_APP_NAME} - Usuário`,
        } as RouteData,
    },
    {
        path: 'user/:login',
        canActivate: [],
        component: accessComponents.CreateUserComponent,
        data: {
            title: `${environment.TITLE_APP_NAME} - Usuário`,
        } as RouteData,
    },
    {
        path: 'find-user',
        canActivate: [],
        component: accessComponents.FindUserComponent,
        data: {
            title: `${environment.TITLE_APP_NAME} - Usuário`,
        } as RouteData,
    },
    {
        path: 'roles',
        canActivate: [],
        component: accessComponents.RolesComponent,
        data: {
            title: `${environment.TITLE_APP_NAME} - Papéis`,
        } as RouteData,
    },
    {
        path: 'key-value-config',
        canActivate: [],
        component: accessComponents.KeyValueConfigComponent,
        data: {
            title: `${environment.TITLE_APP_NAME} - Configs`,
        } as RouteData,
    },
    {
        path: 'organization',
        canActivate: [],
        component: accessComponents.OrganizationComponent,
        data: {
            title: `${environment.TITLE_APP_NAME} - Organização`,
        } as RouteData,
    }
];

@NgModule({
    imports: [AccessModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class AccessRoutingModule {}
