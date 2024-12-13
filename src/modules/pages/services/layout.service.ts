import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EstadoDTO, MunicipioDTO } from '@modules/shared/models/layout.utils';

@Injectable()
export class LayoutService {
    private _API_URL_ENDPOINT: string;
    private _genericUrl: string;
    private _estadoUrl: string;
    private _municipioUrl: string;
    private _urlUtils: string;
    private _API_URL_ENDPOINT_NODEJS: string;
    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._genericUrl = '/api/busca-cep';
        this._estadoUrl = '/api/estados';
        this._municipioUrl = '/api/municipios';
        this._API_URL_ENDPOINT_NODEJS = sessionStorage.getItem('urlEndPointNodejs')!;
        this._urlUtils = '/api/utils/data-atual';
    }

    isLoggedAndConfigsSession(): boolean {
        let isLoggedAndConfigs = false;
        const currentUserSalesApp: any = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);

        if (currentUserSalesApp != null &&
            currentUserSalesApp.token != null && currentUserSalesApp.token.length > 0 &&
            currentUserSalesApp.user != null &&
            sessionStorage.getItem('urlEndPointSales') &&
            sessionStorage.getItem('urlEndPointNodejs')) {
            isLoggedAndConfigs = true;
        }

        return isLoggedAndConfigs;
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._genericUrl);
    }

    getDataAtual(): Observable<any> {
        return this._http.get(this._API_URL_ENDPOINT + this._urlUtils);
    }

    buscaCep(cep: string): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT + this._genericUrl + '/' + cep);
    }

    buscaEstados(): Observable<EstadoDTO[]> {
        return this._http.get<EstadoDTO[]>(this._API_URL_ENDPOINT + this._estadoUrl);
    }

    buscaMunicipios(): Observable<MunicipioDTO[]> {
        return this._http.get<MunicipioDTO[]>(this._API_URL_ENDPOINT + this._municipioUrl);
    }

    buscaMunicipiosResumo(municipio: string): Observable<MunicipioDTO[]> {
        return this._http.get<MunicipioDTO[]>(this._API_URL_ENDPOINT + this._municipioUrl + '/busca-nome/' + municipio);
    }

    buscaMunicipioPorEstado(ufEstado: string): Observable<MunicipioDTO[]> {
        return this._http.get<MunicipioDTO[]>(this._API_URL_ENDPOINT + this._municipioUrl + '/busca-uf/' + ufEstado);
    }
}
