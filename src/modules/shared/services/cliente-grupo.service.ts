import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ClienteGrupoDTO } from '../models/cliente';

@Injectable()
export class ClienteGrupoService {
    private _API_URL_ENDPOINT: string;
    private _url: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url = '/api/cliente-grupos';
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }

    getAll(): Observable<ClienteGrupoDTO[]> {
        return this._http.get<ClienteGrupoDTO[]>(this._API_URL_ENDPOINT + this._url);
    }

    getAllActive(): Observable<ClienteGrupoDTO[]> {
        return this._http.get<ClienteGrupoDTO[]>(this._API_URL_ENDPOINT + this._url + '/all-active');
    }

    findByName(nome: string): Observable<ClienteGrupoDTO[]> {
        return this._http.get<ClienteGrupoDTO[]>(
            this._API_URL_ENDPOINT + this._url + '/busca-nome/' + nome);
    }

    find(grupoCliente: ClienteGrupoDTO): Observable<ClienteGrupoDTO[]> {
        return this._http.post<ClienteGrupoDTO[]>(
            this._API_URL_ENDPOINT + this._url + '/busca',
            grupoCliente);
    }

    postOrPut(grupoCliente: ClienteGrupoDTO, status: number): Observable<ClienteGrupoDTO> {
        if (status === 1) {
            return this._http.post<ClienteGrupoDTO>(this._API_URL_ENDPOINT + this._url, grupoCliente);
        } else {
            return this._http.put<ClienteGrupoDTO>(this._API_URL_ENDPOINT + this._url, grupoCliente);
        }
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }

}
