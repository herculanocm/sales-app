import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ConfGeraisDTO, ConfMsg } from '../models/configuracoes';

@Injectable()
export class ConfGeraisService {
    private _API_URL_ENDPOINT: string;
    private _url: string;


    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url = '/api/conf-gerais';
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }

    getConfById(id: number): Observable<ConfGeraisDTO> {
        return this._http.get<ConfGeraisDTO>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }

    put(conf: ConfGeraisDTO): Observable<ConfGeraisDTO> {
        return this._http.put<ConfGeraisDTO>(this._API_URL_ENDPOINT + this._url, conf);
    }

    saveConfMsg(confMsg: ConfMsg): Observable<ConfMsg> {
        return this._http.put<ConfMsg>(this._API_URL_ENDPOINT + '/api/conf-msg', confMsg);
    }

    getConfMsg(): Observable<ConfMsg> {
        return this._http.get<ConfMsg>(this._API_URL_ENDPOINT + '/api/conf-msg');
    }

    getMsgByUser(id: number): Observable<ConfMsg> {
        return this._http.get<ConfMsg>(this._API_URL_ENDPOINT + '/api/conf-msg/user/' + id);
    }

    msgReaded(userId: number): Observable<any> {
        return this._http.put<any>(this._API_URL_ENDPOINT + '/api/conf-msg/user', {id: userId});
    }
}
