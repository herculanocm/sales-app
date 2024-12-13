import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstoqueAlmoxarifadoDTO } from '../models/item';


@Injectable()
export class EstoqueAlmoxarifadoService {
    private _API_URL_ENDPOINT: string;
    private _http: HttpClient;
    private _url: string;

    constructor(http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._http = http;
        this._url = '/api/estoque-almoxarifados';
    }
    getAll(): Observable<EstoqueAlmoxarifadoDTO[]> {
        return this._http.get<EstoqueAlmoxarifadoDTO[]>(this._API_URL_ENDPOINT + this._url);
    }

    getAllActive(): Observable<EstoqueAlmoxarifadoDTO[]> {
        return this._http.get<EstoqueAlmoxarifadoDTO[]>(this._API_URL_ENDPOINT + this._url + '/all-active');
    }

    findByName(nome: string): Observable<EstoqueAlmoxarifadoDTO[]> {
        return this._http.get<EstoqueAlmoxarifadoDTO[]>(
            this._API_URL_ENDPOINT + this._url + '/busca-nome/' + nome);
    }

    find(almoxarifado: EstoqueAlmoxarifadoDTO): Observable<EstoqueAlmoxarifadoDTO[]> {
        return this._http.post<EstoqueAlmoxarifadoDTO[]>(
            this._API_URL_ENDPOINT + this._url + '/busca',
            almoxarifado);
    }

    postOrPut(almoxarifado: EstoqueAlmoxarifadoDTO, status: number): Observable<EstoqueAlmoxarifadoDTO> {
        if (status === 1) {
            return this._http.post<EstoqueAlmoxarifadoDTO>(this._API_URL_ENDPOINT + this._url, almoxarifado);
        } else {
            return this._http.put<EstoqueAlmoxarifadoDTO>(this._API_URL_ENDPOINT + this._url, almoxarifado);
        }
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }
}
