import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BancoFebrabanDTO } from '../../configuracoes/banco-febraban';
import { PageTituloDespesa, TituloDespesaDTO, TituloDespesaPesquisaDTO, TituloTipoDTO } from '../models/titulo';
import { ClienteDTO } from '../models/cliente';
import { FornecedorDTO } from '../models/fornecedor';

@Injectable()
export class TituloDespesaService {
    private _API_URL_ENDPOINT: string;
    private _FILE_DOWNLOAD_RESOURCE: string;
    private _url: string;

    private _url_banco_febraban: string;
    private _url_titulo_tipos: string;
    private _url_clientes: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._url = '/api/titulo-despesas';
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
    postOrPut(tituloDespesaDTO: TituloDespesaDTO, status: number): Observable<TituloDespesaDTO> {
        if (status === 1) {
            return this._http.post<TituloDespesaDTO>(
                this._API_URL_ENDPOINT + this._url,
                tituloDespesaDTO,
            );
        } else {
            return this._http.put<TituloDespesaDTO>(
                this._API_URL_ENDPOINT + this._url,
                tituloDespesaDTO,
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
    find(tituloDespesaPesquisaDTO: TituloDespesaPesquisaDTO): Observable<PageTituloDespesa> {
        return this._http.post<PageTituloDespesa>(this._API_URL_ENDPOINT + this._url + '/busca', tituloDespesaPesquisaDTO);
    }
    geraCSV(tituloDespesaPesquisaDTO: TituloDespesaPesquisaDTO): Observable<any> {
        return this._http.post<any>(this._API_URL_ENDPOINT + this._url + '/gera-csv', tituloDespesaPesquisaDTO);
    }
    donwloadCSV(id: number): Observable<Blob> {
        return this._http.get<Blob>(this._FILE_DOWNLOAD_RESOURCE +
            '/download/' + id, { responseType: 'blob' as 'json' });
    }
    findFornecedorById(forncedorId: number): Observable<FornecedorDTO> {
        return this._http.get<FornecedorDTO>(this._API_URL_ENDPOINT + '/api/fornecedors' + '/' + forncedorId);
    }
    findFornecedorByName(nome: string): Observable<FornecedorDTO[]> {
        return this._http.get<FornecedorDTO[]>(
            this._API_URL_ENDPOINT + '/api/fornecedors' + '/busca-nome/' + nome);
    }
}
