import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './app.pages.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/pages',
  },
  {
    path: 'pages',
    loadChildren: () =>
      import('modules/pages/pages-routing.module').then(
        (m) => m.PagesRoutingModule
      ),
    canActivate: [authGuard]
  },
  { path: 'print', loadChildren: () => import('modules/print/print.module').then(pr => pr.PrintModule) },
  {
    path: 'login',
    loadChildren: () =>
      import('modules/login/login.module').then(
        (m) => m.LoginModule
      ),
  },
  {
    path: 'error',
    loadChildren: () =>
      import('modules/error/error-routing.module').then((m) => m.ErrorRoutingModule),
  },
  {
    path: '**',
    pathMatch: 'full',
    loadChildren: () =>
      import('modules/error/error-routing.module').then((m) => m.ErrorRoutingModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
