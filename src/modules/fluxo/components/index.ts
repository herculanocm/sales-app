import { ClienteVendasModalAlertComponent } from "./cliente-vendas/cliente-vendas.component";
import { FluxoCentroComponent } from "./fluxo-centro/fluxo-centro.component";
import { FluxoClienteComponent } from "./fluxo-cliente/fluxo-cliente.component";
import { FluxoTipoComponent } from "./fluxo-tipo/fluxo-tipo.component";
import { AppFluxoAlertModalAlertComponent } from "./modal-alert/app-alert-modal-alert.component";
import { AppFluxoModalConfirmComponent } from "./modal-confirm/app-fluxo-modal-confirm.component";

export const components = [
    FluxoCentroComponent,
    FluxoClienteComponent,
    FluxoTipoComponent,
    AppFluxoModalConfirmComponent,
    AppFluxoAlertModalAlertComponent,
    ClienteVendasModalAlertComponent
];

export * from "./fluxo-centro/fluxo-centro.component";
export * from "./fluxo-cliente/fluxo-cliente.component";
export * from "./fluxo-tipo/fluxo-tipo.component";
export * from "./modal-confirm/app-fluxo-modal-confirm.component";
export * from "./modal-alert/app-alert-modal-alert.component";
export * from "./cliente-vendas/cliente-vendas.component";
