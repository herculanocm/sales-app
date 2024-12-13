import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ItemGrupoDTO } from '../models/item';

@Injectable()
export class ItemGrupoService {
    private _API_URL_ENDPOINT: string;
    private _url: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url  = '/api/item-grupos';
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }

    getAll(): Observable<ItemGrupoDTO[]> {
        return this._http.get<ItemGrupoDTO[]>(this._API_URL_ENDPOINT + this._url);
    }

    find(grupo: ItemGrupoDTO): Observable<ItemGrupoDTO[]> {
        return this._http.post<ItemGrupoDTO[]>(
            this._API_URL_ENDPOINT + this._url + '/busca',
            grupo);
    }

    findByName(nome: string): Observable<ItemGrupoDTO[]> {
        return this._http.get<ItemGrupoDTO[]>(
            this._API_URL_ENDPOINT + this._url + '/busca-nome/' + nome);
    }

    postOrPut(grupo: ItemGrupoDTO, status: number): Observable<ItemGrupoDTO> {
        if (status === 1) {
            return this._http.post<ItemGrupoDTO>(
                this._API_URL_ENDPOINT + this._url,
                grupo,
            );
        } else {
            return this._http.put<ItemGrupoDTO>(
                this._API_URL_ENDPOINT + this._url,
                grupo,
            );
        }
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }

}
