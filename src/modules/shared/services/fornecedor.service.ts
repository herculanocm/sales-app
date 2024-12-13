import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FornecedorDTO, FornecedorPesquisaDTO, PageFornecedor } from '../models/fornecedor';

@Injectable()
export class FornecedorService {
    private _API_URL_ENDPOINT: string;
    private _fornecedorUrl: string;
    private _buscaCep: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._fornecedorUrl = '/api/fornecedors';
        this._buscaCep = '/busca-cep';
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._fornecedorUrl);
    }

    getAll(): Observable<FornecedorDTO[]> {
        return this._http.get<FornecedorDTO[]>(this._API_URL_ENDPOINT + this._fornecedorUrl);
    }

    find(fornecedor: FornecedorDTO): Observable<FornecedorDTO[]> {
        return this._http.post<FornecedorDTO[]>(
            this._API_URL_ENDPOINT + this._fornecedorUrl + '/busca',
            fornecedor);
    }

    findByPage(fornecedorPesquisaDTO: FornecedorPesquisaDTO): Observable<PageFornecedor> {
        return this._http.post<PageFornecedor>(
            this._API_URL_ENDPOINT + this._fornecedorUrl + '/busca',
            fornecedorPesquisaDTO);
    }

    findById(id: number): Observable<FornecedorDTO> {
        return this._http.get<FornecedorDTO>(this._API_URL_ENDPOINT + this._fornecedorUrl + '/' + id);
    }

    findByName(nome: string): Observable<FornecedorDTO[]> {
        return this._http.get<FornecedorDTO[]>(
            this._API_URL_ENDPOINT + this._fornecedorUrl + '/busca-nome/' + nome);
    }

    postOrPut(fornecedor: FornecedorDTO, status: number): Observable<FornecedorDTO> {
        if (status === 1) {
            return this._http.post<FornecedorDTO>(
                this._API_URL_ENDPOINT + this._fornecedorUrl,
                fornecedor,
            );
        } else {
            return this._http.put<FornecedorDTO>(
                this._API_URL_ENDPOINT + this._fornecedorUrl,
                fornecedor,
            );
        }
    }

    buscaCep(cep: string): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT + this._fornecedorUrl + this._buscaCep + '/' + cep);
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._fornecedorUrl + '/' + id);
    }

}
