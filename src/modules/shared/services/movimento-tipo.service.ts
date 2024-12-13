import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MovimentoTipoDTO } from '../models/movimento';

@Injectable()
export class MovimentoTipoService {
    private _API_URL_ENDPOINT: string;
    private _url: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url = '/api/movimento-tipos';
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }

    getAll(): Observable<MovimentoTipoDTO[]> {
        return this._http.get<MovimentoTipoDTO[]>(this._API_URL_ENDPOINT + this._url);
    }

    getAllActive(): Observable<MovimentoTipoDTO[]> {
        return this._http.get<MovimentoTipoDTO[]>(this._API_URL_ENDPOINT + this._url + '/all-active');
    }

    findByName(nome: string): Observable<MovimentoTipoDTO[]> {
        return this._http.get<MovimentoTipoDTO[]>(
            this._API_URL_ENDPOINT + this._url + '/busca-nome/' + nome);
    }

    find(movimentoTipo: MovimentoTipoDTO): Observable<MovimentoTipoDTO[]> {
        return this._http.post<MovimentoTipoDTO[]>(
            this._API_URL_ENDPOINT + this._url + '/busca',
            movimentoTipo);
    }

    postOrPut(movimentoTipo: MovimentoTipoDTO, status: number): Observable<MovimentoTipoDTO> {
        if (status === 1) {
            return this._http.post<MovimentoTipoDTO>(this._API_URL_ENDPOINT + this._url, movimentoTipo);
        } else {
            return this._http.put<MovimentoTipoDTO>(this._API_URL_ENDPOINT + this._url, movimentoTipo);
        }
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }
}
