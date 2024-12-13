import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BancoFebrabanDTO } from '../../configuracoes/banco-febraban';
import { ChequeRecebidoDTO, ChequeRecebidoPesquisaDTO, PageChequeRecebidos } from '../models/titulo';
import { ClienteDTO } from '../models/cliente';
import { StorageMap } from '@ngx-pwa/local-storage';

@Injectable()
export class ChequeRecebidoService {
    private _API_URL_ENDPOINT: string;
    private _FILE_DOWNLOAD_RESOURCE: string;
    private _url: string;

    private _url_banco_febraban: string;
    private _url_clientes: string;

    constructor(
        private _http: HttpClient,
        private storage: StorageMap
        ) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url = '/api/cheque-recebidos';
        this._url_banco_febraban = '/api/banco-febrabans';
        this._url_clientes = '/api/clientes';
        this._FILE_DOWNLOAD_RESOURCE = sessionStorage.getItem('urlEndPointSales') + '/api/files';
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

    storageSet(chave: string, valor: any): Observable<any> {
        return this.storage.set(chave, valor);
    }

    getBancoFebraban(): Observable<BancoFebrabanDTO[]> {
        return this._http.get<BancoFebrabanDTO[]>(this._API_URL_ENDPOINT + this._url_banco_febraban);
    }
    postOrPut(chequeRecebidoDTO: ChequeRecebidoDTO, status: number): Observable<ChequeRecebidoDTO> {
        if (status === 1) {
            return this._http.post<ChequeRecebidoDTO>(
                this._API_URL_ENDPOINT + this._url,
                chequeRecebidoDTO,
            );
        } else {
            return this._http.put<ChequeRecebidoDTO>(
                this._API_URL_ENDPOINT + this._url,
                chequeRecebidoDTO,
            );
        }
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }
    findByNameResumo(nome: string): Observable<ClienteDTO[]> {
        return this._http.get<ClienteDTO[]>(this._API_URL_ENDPOINT + this._url_clientes + '/busca-nome-resumo/' + nome);
    }
    findById(id: number): Observable<ClienteDTO> {
        return this._http.get<ClienteDTO>(this._API_URL_ENDPOINT + this._url_clientes + '/' + id);
    }
    getRomaneioIdByVendaId(vendaId: number): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT + '/api/romaneios/get-by-venda/' + vendaId);
    }
    find(chequeRecebidoPesquisaDTO: ChequeRecebidoPesquisaDTO): Observable<PageChequeRecebidos> {
        return this._http.post<PageChequeRecebidos>(this._API_URL_ENDPOINT + this._url + '/busca', chequeRecebidoPesquisaDTO);
    }
    geraCSV(chequeRecebidoPesquisaDTO: ChequeRecebidoPesquisaDTO): Observable<any[]> {
        return this._http.post<any[]>(this._API_URL_ENDPOINT + this._url + '/gera-csv', chequeRecebidoPesquisaDTO);
    }
    donwloadCSV(id: number): Observable<Blob> {
        return this._http.get<Blob>(this._FILE_DOWNLOAD_RESOURCE +
            '/download/' + id, { responseType: 'blob' as 'json' });
    }

    receberFinanceiro(id: number | null): Observable<ChequeRecebidoDTO> {
        return this._http.get<ChequeRecebidoDTO>(this._API_URL_ENDPOINT + this._url + '/receber-financeiro/' + id);
    }
}
