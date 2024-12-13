/* tslint:disable: ordered-imports*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/* Module */
import { ErrorModule } from './error.module';

/* Containers */
import * as errorContainers from './containers';

/* Guards */
import * as errorGuards from './guards';
import { RouteData } from '@modules/navigation/models';

/* Routes */
export const ROUTES: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '404-2',
    },
    {
        path: '400',
        canActivate: [],
        component: errorContainers.Error400Component,
        data: {
            title: 'Error 400 - SB Admin Pro Angular',
        } as RouteData,
    },
    {
        path: '401',
        canActivate: [],
        component: errorContainers.Error401Component,
        data: {
            title: 'Error 401 - SB Admin Pro Angular',
        } as RouteData,
    },
    {
        path: '403',
        canActivate: [],
        component: errorContainers.Error403Component,
        data: {
            title: 'Error 403 - SB Admin Pro Angular',
        } as RouteData,
    },
    {
        path: '404-1',
        canActivate: [],
        component: errorContainers.Error4041Component,
        data: {
            title: 'Error 404 - SB Admin Pro Angular',
        } as RouteData,
    },
    {
        path: '404-2',
        canActivate: [],
        component: errorContainers.Error4042Component,
        data: {
            title: 'Error 404 - SB Admin Pro Angular',
        } as RouteData,
    },
    {
        path: '500',
        canActivate: [],
        component: errorContainers.Error500Component,
        data: {
            title: 'Error 500 - SB Admin Pro Angular',
        } as RouteData,
    },
    {
        path: '503',
        canActivate: [],
        component: errorContainers.Error503Component,
        data: {
            title: 'Error 503 - SB Admin Pro Angular',
        } as RouteData,
    },
    {
        path: '504',
        canActivate: [],
        component: errorContainers.Error504Component,
        data: {
            title: 'Error 504 - SB Admin Pro Angular',
        } as RouteData,
    },
    {
        path: '**',
        pathMatch: 'full',
        canActivate: [],
        component: errorContainers.Error4042Component,
        data: {
            title: 'Error 404 - Start Boostrap Docs',
        } as RouteData,
    },
];

@NgModule({
    imports: [ErrorModule, RouterModule.forChild(ROUTES)],
    exports: [RouterModule],
})
export class ErrorRoutingModule {}
