import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ConsultaRelatorioDTO } from '../consultas.utils';

@Injectable()
export class RelatorioService {
    private _url: string;
    private _API_URL_ENDPOINT: string;
    private _API_URL_ENDPOINT_NODEJS: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._API_URL_ENDPOINT_NODEJS = sessionStorage.getItem('urlEndPointNodejs')!;
        this._url = '/api/consultas';
    }
    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }
    buscaConsultaPorUsuario(usuario: string): Observable<ConsultaRelatorioDTO[]> {
        return this._http.post<ConsultaRelatorioDTO[]> (this._API_URL_ENDPOINT_NODEJS + this._url + '/usuario', {usuario: usuario});
    }
}
