import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { VendaComponent } from './venda/venda.component';

@Injectable({
  providedIn: 'root'
})
export class VendaDectivateService implements CanDeactivate<VendaComponent> {

  canDeactivate(
    component: VendaComponent,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    // console.log(route);
    // console.log(component);
    if (component.deviceAcess.isMobile) {
      return window.confirm(`Você está tentando sair da pagina
      se clicar em ok saíra da pagina`);
    } else {
    return true;
    }
  }
}
