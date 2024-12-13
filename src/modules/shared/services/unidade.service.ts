import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ItemUnidadeDTO } from '../models/item';

@Injectable()
export class ItemUnidadeService {
    private _API_URL_ENDPOINT: string;
    private _url: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url = '/api/item-unidades';
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }

    getAll(): Observable<ItemUnidadeDTO[]> {
        return this._http.get<ItemUnidadeDTO[]>(this._API_URL_ENDPOINT + this._url);
    }

    find(unidade: ItemUnidadeDTO): Observable<ItemUnidadeDTO[]> {
        return this._http.post<ItemUnidadeDTO[]>(
            this._API_URL_ENDPOINT + this._url + '/busca',
            unidade);
    }

    postOrPut(unidade: ItemUnidadeDTO, status: number): Observable<ItemUnidadeDTO> {
        if (status === 1) {
            return this._http.post<ItemUnidadeDTO>(
                this._API_URL_ENDPOINT + this._url,
                unidade,
            );
        } else {
            return this._http.put<ItemUnidadeDTO>(
                this._API_URL_ENDPOINT + this._url,
                unidade,
            );
        }
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }

}
