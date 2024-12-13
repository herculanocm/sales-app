import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BanckingTitNossoNumeroAux, SalesTituloRetCsvAux, TituloCSVImportAux } from '../models/titulo';

@Injectable()
export class TitulosService {
    private _API_URL_ENDPOINT: string;
    private _url: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url = '/api/titulo-recebers';
    }
    
    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }
    getTitulosSalesWinthor(banckingTitNossoNumeroAux: BanckingTitNossoNumeroAux): Observable<SalesTituloRetCsvAux[]> {
        return this._http.post<SalesTituloRetCsvAux[]>(this._API_URL_ENDPOINT + this._url + '/get-sales-winthor-csv', banckingTitNossoNumeroAux);
    }
    baixaTitulosSalesByCSV(titBaixarFlt: TituloCSVImportAux[]) : Observable<any> {
        return this._http.post<any>(this._API_URL_ENDPOINT + this._url + '/baixa-sales-winthor-csv', { titulos: titBaixarFlt });
    }
}
