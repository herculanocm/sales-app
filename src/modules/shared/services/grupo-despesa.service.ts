import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GrupoDespesaDTO } from '../models/titulo';

@Injectable()
export class GrupoDespesaService {
    private _API_URL_ENDPOINT: string;
    private _url: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url  = '/api/grupo-despesas';
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }

    getAll(): Observable<GrupoDespesaDTO[]> {
        return this._http.get<GrupoDespesaDTO[]>(this._API_URL_ENDPOINT + this._url);
    }

    find(grupo: GrupoDespesaDTO): Observable<GrupoDespesaDTO[]> {
        return this._http.post<GrupoDespesaDTO[]>(
            this._API_URL_ENDPOINT + this._url + '/busca',
            grupo);
    }

    postOrPut(grupo: GrupoDespesaDTO, status: number): Observable<GrupoDespesaDTO> {
        if (status === 1) {
            return this._http.post<GrupoDespesaDTO>(
                this._API_URL_ENDPOINT + this._url,
                grupo,
            );
        } else {
            return this._http.put<GrupoDespesaDTO>(
                this._API_URL_ENDPOINT + this._url,
                grupo,
            );
        }
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }

}
