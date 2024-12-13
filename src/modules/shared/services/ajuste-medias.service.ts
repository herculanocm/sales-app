import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AjusteMediasService {
    private _API_URL_ENDPOINT_NODEJS: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT_NODEJS = sessionStorage.getItem('urlEndPointNodejs')!;
    }

    getMediasItens(anoMes: number, alxEntrada: number, alxSaida: number): Observable<any> {
        return this._http.post<any>(this._API_URL_ENDPOINT_NODEJS + '/api/medias/entrada-saida',
        { anoMes: anoMes, alxEntrada: alxEntrada, alxSaida: alxSaida });
    }
    atualizaVlrSub(vlrSub: number, anoMes: number, itemId: number, username: string): Observable<any> {
        return this._http.post<any>(this._API_URL_ENDPOINT_NODEJS + '/api/medias/item/subvlr',
        { vlrSub: vlrSub, anoMes: anoMes, itemId: itemId, username: username });
    }
}
