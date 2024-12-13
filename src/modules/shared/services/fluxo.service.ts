import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ClienteFluxoCaixaDTO, FluxoCaixaCentroDTO, FluxoCaixaTipoDTO, VendaDTOAuxResumoValor } from '../models/fluxo-caixa';
import { GenericPesquisaDTO, PageGeneric } from '../models/generic';
import { StorageMap } from '@ngx-pwa/local-storage';


@Injectable()
export class FluxoService {
    private _API_URL_ENDPOINT: string;
    private _API_URL_ENDPOINT_NODEJS: string;
    fluxoTipoUrl = '/api/fluxo-caixa/tipo';
    fluxoCentroUrl = '/api/fluxo-caixa/centro';
    fluxoClienteUrl = '/api/fluxo-caixa/cliente';

    constructor(private _http: HttpClient, private storage: StorageMap,) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._API_URL_ENDPOINT_NODEJS = sessionStorage.getItem('urlEndPointNodejs')!;
    }

    storageSet(chave: string, valor: any): Observable<any> {
        return this.storage.set(chave, valor);
    }
    storageGet(chave: string): Observable<any> {
        return this.storage.get(chave);
    }
    storageDelete(chave: string): Observable<any> {
        return this.storage.delete(chave);
    }

    isHashContext(): boolean {
        return window.location.href.toString().indexOf('#') === -1 ? false : true;
    }

    hrefContext(): string {
        let href = window.location.href.toString();
        if (this.isHashContext() === true) {
            href = href.substring(0, href.indexOf('#') - 1);
            href = href + '/#/';
        } else {
            href = href.substring(0, href.indexOf('/', 8));
            href = href + '/';
        }
        return href;
    }

    postOrPutFuxoTipo(fluxoTipo: any, status: number): Observable<FluxoCaixaTipoDTO> {
        if (status === 1) {
            return this._http.post<FluxoCaixaTipoDTO>(
                this._API_URL_ENDPOINT + this.fluxoTipoUrl,
                fluxoTipo,
            );
        } else {
            return this._http.put<FluxoCaixaTipoDTO>(
                this._API_URL_ENDPOINT + this.fluxoTipoUrl,
                fluxoTipo,
            );
        }
    }

    getAllFluxoItemActive(): Observable<FluxoCaixaTipoDTO[]> {
        return this._http.get<FluxoCaixaTipoDTO[]>(this._API_URL_ENDPOINT + this.fluxoTipoUrl + '/actives');
    }

    getAllFluxoCentroActive(): Observable<FluxoCaixaCentroDTO[]> {
        return this._http.get<FluxoCaixaCentroDTO[]>(this._API_URL_ENDPOINT + this.fluxoCentroUrl + '/actives');
    }

    findFluxoItem(fluxoTipoPesquisaDTO: GenericPesquisaDTO<FluxoCaixaTipoDTO>): Observable<PageGeneric<FluxoCaixaTipoDTO>> {
        return this._http.post<PageGeneric<FluxoCaixaTipoDTO>>(this._API_URL_ENDPOINT + this.fluxoTipoUrl + '/busca', fluxoTipoPesquisaDTO);
    }

    delFluxoTipo(id: number): Observable<any> {
        return this._http.delete(this._API_URL_ENDPOINT + this.fluxoTipoUrl + '/' + id);
    }

    postOrPutFuxoCentro(fluxoTipo: any, status: number): Observable<FluxoCaixaCentroDTO> {
        if (status === 1) {
            return this._http.post<FluxoCaixaCentroDTO>(
                this._API_URL_ENDPOINT + this.fluxoCentroUrl,
                fluxoTipo,
            );
        } else {
            return this._http.put<FluxoCaixaCentroDTO>(
                this._API_URL_ENDPOINT + this.fluxoCentroUrl,
                fluxoTipo,
            );
        }
    }

    findFluxoCentro(fluxoCentroPesquisaDTO: GenericPesquisaDTO<FluxoCaixaCentroDTO>): Observable<PageGeneric<FluxoCaixaCentroDTO>> {
        return this._http.post<PageGeneric<FluxoCaixaCentroDTO>>(this._API_URL_ENDPOINT + this.fluxoCentroUrl + '/busca', fluxoCentroPesquisaDTO);
    }

    delFluxoCentro(id: number): Observable<any> {
        return this._http.delete(this._API_URL_ENDPOINT + this.fluxoCentroUrl + '/' + id);
    }

    postOrPutClienteFluxo(fluxoTipo: any, status: number): Observable<ClienteFluxoCaixaDTO> {
        if (status === 1) {
            return this._http.post<ClienteFluxoCaixaDTO>(
                this._API_URL_ENDPOINT + this.fluxoClienteUrl,
                fluxoTipo,
            );
        } else {
            return this._http.put<ClienteFluxoCaixaDTO>(
                this._API_URL_ENDPOINT + this.fluxoClienteUrl,
                fluxoTipo,
            );
        }
    }

    findClienteFluxo(clienteFluxoPesquisa: GenericPesquisaDTO<ClienteFluxoCaixaDTO>): Observable<PageGeneric<ClienteFluxoCaixaDTO>> {
        return this._http.post<PageGeneric<ClienteFluxoCaixaDTO>>(this._API_URL_ENDPOINT + this.fluxoClienteUrl + '/busca', clienteFluxoPesquisa);
    }

    findClienteFluxoSintetico(clienteFluxoPesquisa: GenericPesquisaDTO<ClienteFluxoCaixaDTO>): Observable<any> {
        return this._http.post<any>(this._API_URL_ENDPOINT + '/api/fluxo-caixa/cliente/report-sintetico/busca', clienteFluxoPesquisa);
    }

    delClienteFluxo(id: number): Observable<any> {
        return this._http.delete(this._API_URL_ENDPOINT + this.fluxoClienteUrl + '/' + id);
    }

    findVendaAux(prevendaId: number): Observable<VendaDTOAuxResumoValor> {
        return this._http.get<VendaDTOAuxResumoValor>(this._API_URL_ENDPOINT_NODEJS + '/api/v2/venda/venda-aux-resumo-valor/' + prevendaId);
    }

    getVendasCliente(clienteId: number, dtaEmissaoInicial: Date, dtaEmissaoFinal: Date): Observable<VendaDTOAuxResumoValor[]> {
        return this._http.post<VendaDTOAuxResumoValor[]>(this._API_URL_ENDPOINT_NODEJS + '/api/v2/venda/venda-aux-resumo-valor/cliente', {clienteId: clienteId, dtaEmissaoInicial: dtaEmissaoInicial, dtaEmissaoFinal: dtaEmissaoFinal});
    }


}
