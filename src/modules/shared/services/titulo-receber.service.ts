import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NossoNumeroUpdateAux, PageTituloReceber, TituloReceberDTO, TituloReceberPesquisaDTO, TituloTipoDTO } from '../models/titulo';
import { BancoFebrabanDTO } from '../models/generic';
import { ClienteDTO } from '../models/cliente';

@Injectable()
export class TituloReceberService {
    private _API_URL_ENDPOINT: string;
    private _API_URL_ENDPOINT_NODEJS: string;
    private _FILE_DOWNLOAD_RESOURCE: string;
    private _url: string;

    private _url_banco_febraban: string;
    private _url_titulo_tipos: string;
    private _url_clientes: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._API_URL_ENDPOINT_NODEJS = sessionStorage.getItem('urlEndPointNodejs')!;
        this._url = '/api/titulo-recebers';
        this._url_banco_febraban = '/api/banco-febrabans';
        this._url_titulo_tipos = '/api/titulo-tipos';
        this._url_clientes = '/api/clientes';
        this._FILE_DOWNLOAD_RESOURCE = sessionStorage.getItem('urlEndPointSales') + '/api/files';
    }

    getTituloTipos(): Observable<TituloTipoDTO[]> {
        return this._http.get<TituloTipoDTO[]>(this._API_URL_ENDPOINT + this._url_titulo_tipos);
    }
    getBancoFebraban(): Observable<BancoFebrabanDTO[]> {
        return this._http.get<BancoFebrabanDTO[]>(this._API_URL_ENDPOINT + this._url_banco_febraban);
    }
    postOrPut(tituloReceberDTO: TituloReceberDTO, status: number): Observable<TituloReceberDTO> {
        if (status === 1) {
            return this._http.post<TituloReceberDTO>(
                this._API_URL_ENDPOINT + this._url,
                tituloReceberDTO,
            );
        } else {
            return this._http.put<TituloReceberDTO>(
                this._API_URL_ENDPOINT + this._url,
                tituloReceberDTO,
            );
        }
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }
    findByNameResumo(nome: string): Observable<ClienteDTO[]> {
        return this._http.get<ClienteDTO[]>(this._API_URL_ENDPOINT + this._url_clientes + '/busca-nome-resumo/' + nome);
    }
    findById(id: number): Observable<ClienteDTO> {
        return this._http.get<ClienteDTO>(this._API_URL_ENDPOINT + this._url_clientes + '/' + id);
    }
    find(tituloRecerPesquisaDTO: TituloReceberPesquisaDTO): Observable<PageTituloReceber> {
        return this._http.post<PageTituloReceber>(this._API_URL_ENDPOINT + this._url + '/busca', tituloRecerPesquisaDTO);
    }
    geraCSV(tituloRecerPesquisaDTO: TituloReceberPesquisaDTO): Observable<any[]> {
        return this._http.post<any[]>(this._API_URL_ENDPOINT + this._url + '/gera-csv', tituloRecerPesquisaDTO);
    }
    donwloadCSV(id: number): Observable<Blob> {
        return this._http.get<Blob>(this._FILE_DOWNLOAD_RESOURCE +
            '/download/' + id, { responseType: 'blob' as 'json' });
    }
    atualizaNossoNumero(nossoNumeroUpdateAux: NossoNumeroUpdateAux): Observable<NossoNumeroUpdateAux> {
        return this._http.post<NossoNumeroUpdateAux>(this._API_URL_ENDPOINT + this._url + '/update-nosso-numero', nossoNumeroUpdateAux);
    }
    buscaTitulosLote(busca: any): Observable<any[]> {
        return this._http.post<any>(this._API_URL_ENDPOINT + this._url + '/busca-lote', busca);
    }
    processaTitulosLote(tituloReceberCheques: any[]): Observable<any> {
        return this._http.post<any>(this._API_URL_ENDPOINT + this._url + '/processa-lote', tituloReceberCheques);
    }
    buscaLoteByTituloReceberIds(ids: string): Observable<any[]> {
        return this._http.post<any[]>(this._API_URL_ENDPOINT_NODEJS +
            '/api/titulo-receber/cheque-recebido/busca-lote', {ids: ids});
    }
}
