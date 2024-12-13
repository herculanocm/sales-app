import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientesCadastradosMes } from './dashboard.utils';

@Injectable()
export class DashboardsService {
    private _API_URL_ENDPOINT_NODEJS: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT_NODEJS = sessionStorage.getItem('urlEndPointNodejs')!;
    }

    getQtdClientes(): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT_NODEJS + '/api/v2/dashboards/qtd-clientes');
    }

    getQtdFuncionarios(): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT_NODEJS + '/api/v2/dashboards/qtd-funcionarios');
    }

    getQtdItens(): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT_NODEJS + '/api/v2/dashboards/qtd-itens');
    }

    getClientesCadastros(): Observable<ClientesCadastradosMes[]> {
        return this._http.get<ClientesCadastradosMes[]>(this._API_URL_ENDPOINT_NODEJS + '/api/v2/dashboards/clientes-cadastros');
    }
    
    getClientesVsAtivos(): Observable<ClientesCadastradosMes[]> {
        return this._http.get<ClientesCadastradosMes[]>(this._API_URL_ENDPOINT_NODEJS + '/api/v2/dashboards/clientes-vs-ativos');
    }

    getDividaAcumulada(): Observable<ClientesCadastradosMes[]> {
        return this._http.get<ClientesCadastradosMes[]>(this._API_URL_ENDPOINT_NODEJS + '/api/v2/dashboards/divida-acumulada');
    }
}