import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ItemSubCategoriaDTO } from '../models/item';

@Injectable()
export class ItemSubCategoriaService {
    private _API_URL_ENDPOINT: string;
    private _url: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url = '/api/item-subcategorias';
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }

    getAll(): Observable<ItemSubCategoriaDTO[]> {
        return this._http.get<ItemSubCategoriaDTO[]>(this._API_URL_ENDPOINT + this._url);
    }

    getAllActive(): Observable<ItemSubCategoriaDTO[]> {
        return this._http.get<ItemSubCategoriaDTO[]>(this._API_URL_ENDPOINT + this._url + '/all-active');
    }

    find(itemSubCategoria: ItemSubCategoriaDTO): Observable<ItemSubCategoriaDTO[]> {
        return this._http.post<ItemSubCategoriaDTO[]>(
            this._API_URL_ENDPOINT + this._url + '/busca',
            itemSubCategoria);
    }

    postOrPut(itemSubCategoria: ItemSubCategoriaDTO, status: number): Observable<ItemSubCategoriaDTO> {
        if (status === 1) {
            return this._http.post<ItemSubCategoriaDTO>(
                this._API_URL_ENDPOINT + this._url,
                itemSubCategoria,
            );
        } else {
            return this._http.put<ItemSubCategoriaDTO>(
                this._API_URL_ENDPOINT + this._url,
                itemSubCategoria,
            );
        }
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }

}
