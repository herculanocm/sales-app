import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ConsultaQueryAux, RetornoConsultaQueryAux } from './consulta-utils';

@Injectable()
export class ConsultaService {
    private _url: string;
    private _API_URL_ENDPOINT: string;
    private _API_URL_ENDPOINT_NODEJS: string;
    private _urlExecuteQuery: string;
    private _urlGetFile: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._API_URL_ENDPOINT_NODEJS = sessionStorage.getItem('urlEndPointNodejs')!;
        this._url = '/api/consultas';
        this._urlExecuteQuery = '/api/node/execute-query';
        this._urlGetFile = '/api/node/getfile';
    }
    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }
    executeQuery(consultaQueryAux: ConsultaQueryAux): Observable<RetornoConsultaQueryAux> {
        return this._http.post<RetornoConsultaQueryAux>(this._API_URL_ENDPOINT_NODEJS + this._urlExecuteQuery, consultaQueryAux);
    }
    getFileById(idFile: number) {
        return this._http.get(this._API_URL_ENDPOINT_NODEJS + this._urlGetFile + '/' + idFile);
    }
    donwloadCSV(id: number): Observable<Blob> {
        return this._http.get<Blob>(this._API_URL_ENDPOINT_NODEJS + this._urlGetFile + '/' + id, { responseType: 'blob' as 'json' });
    }
    getUrlDownload(): string {
        return this._API_URL_ENDPOINT_NODEJS + this._urlGetFile;
    }
}
