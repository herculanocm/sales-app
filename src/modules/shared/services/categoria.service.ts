import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ItemCategoriaDTO } from '../models/item';

@Injectable()
export class ItemCategoriaService {
    private _API_URL_ENDPOINT: string;
    private _url: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url  = '/api/item-categorias';
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }

    getAll(): Observable<ItemCategoriaDTO[]> {
        return this._http.get<ItemCategoriaDTO[]>(this._API_URL_ENDPOINT + this._url);
    }

    getAllActive(): Observable<ItemCategoriaDTO[]> {
        return this._http.get<ItemCategoriaDTO[]>(this._API_URL_ENDPOINT + this._url + '/all-active');
    }

    find(categoria: ItemCategoriaDTO): Observable<ItemCategoriaDTO[]> {
        return this._http.post<ItemCategoriaDTO[]>(
            this._API_URL_ENDPOINT + this._url + '/busca',
            categoria);
    }

    postOrPut(categoria: ItemCategoriaDTO, status: number): Observable<ItemCategoriaDTO> {
        if (status === 1) {
            return this._http.post<ItemCategoriaDTO>(
                this._API_URL_ENDPOINT + this._url,
                categoria,
            );
        } else {
            return this._http.put<ItemCategoriaDTO>(
                this._API_URL_ENDPOINT + this._url,
                categoria,
            );
        }
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }

}
