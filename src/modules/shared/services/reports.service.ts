import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ReportPostBodySuperVend, ReportQuad1, ReportUserWithLevelAccessSupervisor } from '../models/reports';

@Injectable()
export class ReportsService {
    _API_URL_ENDPOINT_SALES = sessionStorage.getItem('urlEndPointSales')!;
    _API_URL_ENDPOINT_NODEJS = sessionStorage.getItem('urlEndPointNodejs')!;

    constructor(private _http: HttpClient) { }

    find_sellers(username: string): Observable<ReportUserWithLevelAccessSupervisor[]> {
        return this._http.get<ReportUserWithLevelAccessSupervisor[]>(this._API_URL_ENDPOINT_NODEJS + '/api/reports/vendas/representantes/planilha/' + username);
    }

    findIndQuad1(vl: ReportPostBodySuperVend): Observable<ReportQuad1[]> {
        return this._http.post<ReportQuad1[]>(this._API_URL_ENDPOINT_NODEJS + '/api/reports/vendas/planilha/indicador_quad_1', vl);
    }
}
