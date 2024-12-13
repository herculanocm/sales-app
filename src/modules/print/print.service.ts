import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Injectable()
export class PrintService {
    private _API_URL_ENDPOINT: string;
    private _url: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url = '/api/rotas';
    }
    getDataAtualServidor(): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT);
    }

    findRotaById(rotaId: number): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT + this._url + '/' + rotaId);
    }
}
