import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ConsultaRelatorioDTO } from './controle-relatorio';
import { ControleRelatorioPesquisaDTO } from './controle-relatorio-pesquisa';
import { PageControleRelatorio } from './page-controle-relatorio';

@Injectable()
export class ControleRelatorioService {
    private _API_URL_ENDPOINT: string;
    private _url: string;


    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url = '/api/consulta-relatorios';
    }

    getUrl(): string {
        return '';
    }

    postOrPut(consultaRelatorioDTO: ConsultaRelatorioDTO, status: number): Observable<ConsultaRelatorioDTO> {
        if (status === 1) {
            return this._http.post<ConsultaRelatorioDTO>(
                this._API_URL_ENDPOINT + this._url,
                consultaRelatorioDTO,
            );
        } else {
            return this._http.put<ConsultaRelatorioDTO>(
                this._API_URL_ENDPOINT + this._url,
                consultaRelatorioDTO,
            );
        }
    }
    find(controleRelatorioPesquisaDTO: ControleRelatorioPesquisaDTO): Observable<PageControleRelatorio> {
        return this._http.post<PageControleRelatorio>(this._API_URL_ENDPOINT + this._url + '/busca', controleRelatorioPesquisaDTO);
    }
    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }
}
