import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CondicaoPagamentoDTO, CondicaoPagamentoPesquisaDTO, PageCondicaoPagamento } from '../models/condicao-pagamento';
import { TituloTipoDTO } from '../models/titulo';


@Injectable()
export class CondicaoPagamentoService {
    private _API_URL_ENDPOINT: string;
    private _url: string;
    private _url_titulo_tipos: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url_titulo_tipos = '/api/titulo-tipos';
        this._url = '/api/condicao-pagamentos';
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }

    getAll(): Observable<CondicaoPagamentoDTO[]> {
        return this._http.get<CondicaoPagamentoDTO[]>(this._API_URL_ENDPOINT + this._url);
    }

    getAllActive(): Observable<CondicaoPagamentoDTO[]> {
        return this._http.get<CondicaoPagamentoDTO[]>(this._API_URL_ENDPOINT + this._url + '/all-active');
    }

    find(condicaoPagamentoPesquisaDTO: CondicaoPagamentoPesquisaDTO): Observable<PageCondicaoPagamento> {
        return this._http.post<PageCondicaoPagamento>(
            this._API_URL_ENDPOINT + this._url + '/busca', condicaoPagamentoPesquisaDTO);
    }

    postOrPut(tipoEndereco: CondicaoPagamentoDTO, status: number): Observable<CondicaoPagamentoDTO> {
        if (status === 1) {
            return this._http.post<CondicaoPagamentoDTO>(
                this._API_URL_ENDPOINT + this._url,
                tipoEndereco,
            );
        } else {
            return this._http.put<CondicaoPagamentoDTO>(
                this._API_URL_ENDPOINT + this._url,
                tipoEndereco,
            );
        }
    }

    findAllActiveTituloTipos(): Observable<TituloTipoDTO[]> {
        return this._http.get<TituloTipoDTO[]>(this._API_URL_ENDPOINT + this._url_titulo_tipos);
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }

}
