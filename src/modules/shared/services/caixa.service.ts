import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageMap } from '@ngx-pwa/local-storage';
import { CustomHttpParamEncoder } from '@modules/clientes/encoder.utils';
import { environment } from 'environments/environment';
import { CaixaDTO, CaixaPesquisaDTO, CaixaTipoMovDTO, PageCaixa } from '../models/caixa';


@Injectable()
export class CaixaService {
    private _API_URL_ENDPOINT: string;
    private _API_URL_ENDPOINT_NODEJS: string;
    private _url: string;
    constructor(private _http: HttpClient,
        private storage: StorageMap
        ) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._API_URL_ENDPOINT_NODEJS = sessionStorage.getItem('urlEndPointNodejs')!;
        this._url = '/api/caixas';
    }
    storageSet(chave: string, valor: any): Observable<any> {
        return this.storage.set(chave, valor);
    }
    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }
    find(caixaPesquisaDTO: CaixaPesquisaDTO): Observable<PageCaixa> {
        return this._http.post<PageCaixa>(this._API_URL_ENDPOINT + this._url + '/busca', caixaPesquisaDTO);
    }
    getTotalChequesByCaixaId(id: number): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT + '/api/caixas/total-cheques/' + id);
    }

    getCaixaIdsByRomaneioId(romaneioId: number): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT + '/api/caixas/find-by-romaneio/' + romaneioId);
    }
    postOrPut(caixaDTO: CaixaDTO, status: number): Observable<CaixaDTO> {
        if (status === 1) {
            return this._http.post<CaixaDTO>(
                this._API_URL_ENDPOINT + this._url,
                caixaDTO,
            );
        } else {
            return this._http.put<CaixaDTO>(
                this._API_URL_ENDPOINT + this._url,
                caixaDTO,
            );
        }
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
    isHashContext(): boolean {
        return window.location.href.toString().indexOf('#') === -1 ? false : true;
    }
    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }

    getAllCaixaTipoMovActive(): Observable<CaixaTipoMovDTO[]> {
        return this._http.get<CaixaTipoMovDTO[]>(this._API_URL_ENDPOINT + '/api/caixa-tipo-mov/actives');
    }

    getVendasEstoqueData(alx: number, dta: string, usuarioCaixa: string): Observable<any> {
        if (usuarioCaixa === null || typeof(usuarioCaixa) === 'undefined' || usuarioCaixa.length === 0) {
            usuarioCaixa = '-1';
        }
        return this._http.get<any>(this._API_URL_ENDPOINT_NODEJS + '/api/caixas/vendas/' + alx + '/' + dta + '/' + usuarioCaixa);
    }

    getRomaneiosEstoqueData(alx: number, dta: string): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT_NODEJS + '/api/caixas/romaneios/' + alx + '/' + dta);
    }
}
