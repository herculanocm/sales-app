import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ItemAlmoxarifadoDTO } from '../models/movimento';
import { EstoqueAlmoxarifadoDTO } from '../models/item';

@Injectable()
export class MovimentoPosicaoItemService {
    private _API_URL_ENDPOINT: string;
    private _url: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url = '/api/itens/estoques';
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }

    get(idEstoqueAlmoxarifado: number, idItem: number): Observable<ItemAlmoxarifadoDTO[]> {
        // idEstoqueAlmoxarifado=1&idItem=1
        let urlWithOptions = '?idEstoqueAlmoxarifado=' + idEstoqueAlmoxarifado;
        if (idItem != null && idItem > 0) {
            urlWithOptions += '&idItem=' + idItem;
        }
        // console.log('urlWithOptions: ' + urlWithOptions);
        return this._http.get<ItemAlmoxarifadoDTO[]>(this._API_URL_ENDPOINT + this._url + urlWithOptions);
    }
    getByName(idEstoqueAlmoxarifado: number, nomeItem: string): Observable<ItemAlmoxarifadoDTO[]> {
        return this._http.get<ItemAlmoxarifadoDTO[]>(this._API_URL_ENDPOINT
            + this._url + '/nome-item/' + idEstoqueAlmoxarifado + '/' + nomeItem);
    }

    getByAlmoxarifados(almoxarifados: EstoqueAlmoxarifadoDTO[], nomeItem: string): Observable<ItemAlmoxarifadoDTO[]> {
        return this._http.post<ItemAlmoxarifadoDTO[]>(this._API_URL_ENDPOINT
            + this._url + '/almoxarifados-item-nome', {almoxarifados: almoxarifados, nomeItem: nomeItem});
    }
}
