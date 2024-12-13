import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TituloTOTVSDTO } from '../models/titulo';

@Injectable()
export class TituloTotvsService {
    private _API_URL_ENDPOINT: string;
    private _url: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url = '/api/totvs-titulos';
    }
    buscaTitulosLote(busca: any): Observable<TituloTOTVSDTO[]> {
        return this._http.post<TituloTOTVSDTO[]>(this._API_URL_ENDPOINT + this._url + '/busca-lote', busca);
    }
    processaTitulosLote(tituloReceber: any): Observable<any> {
        return this._http.post<any>(this._API_URL_ENDPOINT + this._url + '/processa-lote', tituloReceber);
    }
}
