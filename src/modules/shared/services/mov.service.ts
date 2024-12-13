import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageMap } from '@ngx-pwa/local-storage';
import { MovimentoDTO, MovimentoOrigemDTO, MovimentoPesquisaDTO, MovimentoTransfDTO, PageMovimento } from '../models/movimento';

@Injectable()
export class MovService {
    private _API_URL_ENDPOINT: string;
    private _FILE_DOWNLOAD_RESOURCE: string;
    private _url: string;
    private _urlMovimentoOrigem: string;
    private _urlUtils: string;

    constructor(
        private _http: HttpClient,
        private storage: StorageMap,
        ) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._FILE_DOWNLOAD_RESOURCE = sessionStorage.getItem('urlEndPointSales') + '/api/files';
        this._url = '/api/movimentos';
        this._urlMovimentoOrigem = '/api/movimento-origems';
        this._urlUtils = '/api/utils';
    }
    storageSet(chave: string, valor: any): Observable<any> {
        return this.storage.set(chave, valor);
    }
    acertaAlmoxarifados(idAlx1: number, idAlx2: number): Observable<any> {
        return this._http.get(this._API_URL_ENDPOINT + this._urlUtils + '/acerta-difs-alxs/' + idAlx1 + '/' + idAlx2);
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }
    getAll(): Observable<MovimentoDTO[]> {
        return this._http.get<MovimentoDTO[]>(this._API_URL_ENDPOINT + this._url);
    }

    findById(id: number): Observable<MovimentoDTO> {
        return this._http.get<MovimentoDTO>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }

    find(movimentoPesquisa: MovimentoPesquisaDTO): Observable<any> {
        return this._http.post<any>(this._API_URL_ENDPOINT + this._url + '/busca', movimentoPesquisa);
    }

    find2(movimentoPesquisa: MovimentoPesquisaDTO): Observable<PageMovimento> {
        return this._http.post<PageMovimento>(this._API_URL_ENDPOINT + this._url + '/busca2', movimentoPesquisa);
    }

    getAllMovimentoOrigens(): Observable<MovimentoOrigemDTO[]> {
        return this._http.get<MovimentoOrigemDTO[]>(this._API_URL_ENDPOINT + this._urlMovimentoOrigem);
    }

    geraCSV(movimentoPesquisa: MovimentoPesquisaDTO): Observable<any> {
        return this._http.post<any>(this._API_URL_ENDPOINT + this._url + '/gera-csv', movimentoPesquisa);
    }

    donwloadCSV(id: number): Observable<Blob> {
        return this._http.get<Blob>(this._FILE_DOWNLOAD_RESOURCE +
            '/download/' + id, { responseType: 'blob' as 'json' });
    }

    postMovimentoSimples(movimento: MovimentoDTO): Observable<any> {
        return this._http.post<any>(
            this._API_URL_ENDPOINT + this._url + '-simples',
            movimento,
        );
    }

    postMovimentoTransfer(movimentoTransf: MovimentoTransfDTO): Observable<any> {
        return this._http.post<any>(
            this._API_URL_ENDPOINT + this._url + '-almoxarifados',
            movimentoTransf,
        );
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

    postOrPut(movimento: MovimentoDTO, status: number): Observable<MovimentoDTO> {
        if (status === 1) {
            return this._http.post<MovimentoDTO>(
                this._API_URL_ENDPOINT + this._url,
                movimento,
            );
        } else {
            return this._http.put<MovimentoDTO>(
                this._API_URL_ENDPOINT + this._url,
                movimento,
            );
        }
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }
}
