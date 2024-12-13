import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GrupoDespesaDTO, SubGrupoDespesaDTO } from '../models/titulo';

@Injectable()
export class SubGrupoDespesaService {
    private _API_URL_ENDPOINT: string;
    private _url: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url  = '/api/sub-grupo-despesas';
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }

    getAll(): Observable<SubGrupoDespesaDTO[]> {
        return this._http.get<SubGrupoDespesaDTO[]>(this._API_URL_ENDPOINT + this._url);
    }

    find(grupo: SubGrupoDespesaDTO): Observable<SubGrupoDespesaDTO[]> {
        return this._http.post<SubGrupoDespesaDTO[]>(
            this._API_URL_ENDPOINT + this._url + '/busca',
            grupo);
    }


    findAllGrupos(): Observable<GrupoDespesaDTO[]> {
        return this._http.get<GrupoDespesaDTO[]>(this._API_URL_ENDPOINT + '/api/grupo-despesas');
    }

    postOrPut(grupo: SubGrupoDespesaDTO, status: number): Observable<SubGrupoDespesaDTO> {
        if (status === 1) {
            return this._http.post<SubGrupoDespesaDTO>(
                this._API_URL_ENDPOINT + this._url,
                grupo,
            );
        } else {
            return this._http.put<SubGrupoDespesaDTO>(
                this._API_URL_ENDPOINT + this._url,
                grupo,
            );
        }
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }

}
