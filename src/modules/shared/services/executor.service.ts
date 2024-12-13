import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ExecutorService {
    private _API_URL_ENDPOINT: string;
    private _url: string;
    private _api_url_airflow: string;
    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url = '/api/conf-gerais';
        this._api_url_airflow = sessionStorage.getItem('urlEndPointAirflow')!;
    }
    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }
    atualizaLatLongEnderecos(): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT + '/api/utils/proc-address');
    }
    backupPostgres(): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT + '/api/utils/backup-postgres');
    }
    atualizarPlanilhaVendas(dateExecution: Date): Observable<any> {
        return this._http.post<any>(this._api_url_airflow + '/api/v1/dags/Dag_ETL_Vendas_Planilha/dagRuns',
        { execution_date: dateExecution });
    }
    executaProcessoVendas(): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT + '/api/python-utils/executa-vendas');
    }

    copyTitulosWinthor(): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT + '/api/totvs-titulos/copy');
    }

    deployAPI(): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT + '/api/utils/jenkins-api');
    }

    deployNG(): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT + '/api/utils/jenkins-ng');
    }

    bloqueioClientesInadimplentes(): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT + '/api/clientes/bloqueio-inadimplencia');
    }

    desbloqueioClientesInadimplentes(): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT + '/api/clientes/desbloqueio-inadimplencia');
    }
}
