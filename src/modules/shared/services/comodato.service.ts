import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EstoqueAlmoxarifadoDTO } from '../../estoques/estoque-almoxarifado/estoque-almoxarifado';
import { ItemDTO, ItemResumoDTO } from '../models/item';
import { ComodatoAux, EstoqueComodatoAux } from '../models/comodato';

@Injectable()
export class ComodatoService {
    private _API_URL_ENDPOINT: string;
    private _url: string;
    private _API_URL_ENDPOINT_NODEJS: string;


    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url = '/api/comodatos';
        this._API_URL_ENDPOINT_NODEJS = sessionStorage.getItem('urlEndPointNodejs')!;
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }
    findItemById(id: number): Observable<ItemDTO> {
        return this._http.get<ItemDTO>(this._API_URL_ENDPOINT + '/api/itens' + '/' + id);
    }

    nodejsFindComodatoByName(nome: string): Observable<ItemResumoDTO[]> {
        return this._http.get<ItemDTO[]>(this._API_URL_ENDPOINT_NODEJS + '/api/itens/comodato/nome' + '/' + nome);
    }

    nodejsPostComodato(comodato: any): Observable<any> {
        return this._http.post<any>(this._API_URL_ENDPOINT_NODEJS + '/api/itens/comodato', comodato);
    }

    nodejsGetComodatos(clienteId: number): Observable<ComodatoAux[]> {
        return this._http.get<ComodatoAux[]>(this._API_URL_ENDPOINT_NODEJS + '/api/itens/comodato/cliente/' + clienteId);
    }

    nodejsDelComodato(comodatoId: number): Observable<any> {
        return this._http.delete<any>(this._API_URL_ENDPOINT_NODEJS + '/api/itens/comodato/' + comodatoId);
    }

    getAllEstoqueActive(): Observable<EstoqueAlmoxarifadoDTO[]> {
        return this._http.get<EstoqueAlmoxarifadoDTO[]>(this._API_URL_ENDPOINT + '/api/estoque-almoxarifados' + '/all-active');
    }

    getItemSaldoEstoque(idEstoqueAlmoxarifado: number, idItem: number): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT + '/api/itens' + '/estoques/' + idEstoqueAlmoxarifado + '/' + idItem);
    }
    nodejsGetEstoqueComodato(idEstoqueAlmoxarifado: number, idItem: number): Observable<EstoqueComodatoAux[]> {
        return this._http.get<EstoqueComodatoAux[]>(this._API_URL_ENDPOINT_NODEJS +
            '/api/itens/comodato' + '/estoques/' + idEstoqueAlmoxarifado + '/' + idItem);
    }
}
