import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageMap } from '@ngx-pwa/local-storage';

@Injectable()
export class CaixaPrintService {
    private _API_URL_ENDPOINT: string;
    private _url: string;
    constructor(private _http: HttpClient,
        private storage: StorageMap
    ) {
        this._API_URL_ENDPOINT = localStorage.getItem('urlEndPointSales')!;
        this._url = '/api/caixas';
    }
    findById(idCaixa: any): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT + this._url + '/' + idCaixa);
    }
    storageSet(chave: string, valor: any): Observable<any> {
        return this.storage.set(chave, valor);
    }
    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }
    storageGet(chave: string): Observable<any> {
        return this.storage.get(chave);
    }
    storageDelete(chave: string): Observable<any> {
        return this.storage.delete(chave);
    }
}
