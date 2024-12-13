import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ItemMarcaDTO } from '../models/item';


@Injectable()
export class ItemMarcaService {
    private _API_URL_ENDPOINT: string;
    private _url: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url = '/api/item-marcas';
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }

    getAll(): Observable<ItemMarcaDTO[]> {
        return this._http.get<ItemMarcaDTO[]>(this._API_URL_ENDPOINT + this._url);
    }

    getAllActive(): Observable<ItemMarcaDTO[]> {
        return this._http.get<ItemMarcaDTO[]>(this._API_URL_ENDPOINT + this._url + '/all-active');
    }

    find(marca: ItemMarcaDTO): Observable<ItemMarcaDTO[]> {
        return this._http.post<ItemMarcaDTO[]>(
            this._API_URL_ENDPOINT + this._url + '/busca',
            marca);
    }

    postOrPut(marca: ItemMarcaDTO, status: number): Observable<ItemMarcaDTO> {
        if (status === 1) {
            return this._http.post<ItemMarcaDTO>(
                this._API_URL_ENDPOINT + this._url,
                marca,
            );
        } else {
            return this._http.put<ItemMarcaDTO>(
                this._API_URL_ENDPOINT + this._url,
                marca,
            );
        }
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }

}
