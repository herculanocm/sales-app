import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SetorDTO } from '../models/cliente';

@Injectable()
export class SetorService {
    private _API_URL_ENDPOINT: string;
    private _setorUrl: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._setorUrl = '/api/setores';
    }
    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._setorUrl);
    }
    buscaSetores(): Observable<SetorDTO[]> {
        return this._http.get<SetorDTO[]>(this._API_URL_ENDPOINT + this._setorUrl);
    }
    getAll(): Observable<SetorDTO[]> {
        return this._http.get<SetorDTO[]>(this._API_URL_ENDPOINT + this._setorUrl);
    }

    getAllActive(): Observable<SetorDTO[]> {
        return this._http.get<SetorDTO[]>(this._API_URL_ENDPOINT + this._setorUrl + '/all-active');
    }

    findByName(nome: string): Observable<SetorDTO[]> {
        return this._http.get<SetorDTO[]>(
            this._API_URL_ENDPOINT + this._setorUrl + '/busca-nome/' + nome);
    }

    find(grupoCliente: SetorDTO): Observable<SetorDTO[]> {
        return this._http.post<SetorDTO[]>(
            this._API_URL_ENDPOINT + this._setorUrl + '/busca',
            grupoCliente);
    }

    postOrPut(grupoCliente: SetorDTO, status: number): Observable<SetorDTO> {
        if (status === 1) {
            return this._http.post<SetorDTO>(this._API_URL_ENDPOINT + this._setorUrl, grupoCliente);
        } else {
            return this._http.put<SetorDTO>(this._API_URL_ENDPOINT + this._setorUrl, grupoCliente);
        }
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._setorUrl + '/' + id);
    }
}
