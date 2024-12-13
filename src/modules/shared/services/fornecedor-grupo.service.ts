import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FornecedorGrupoDTO } from '../models/fornecedor';

@Injectable()
export class FornecedorGrupoService {
    private _API_URL_ENDPOINT: string;
    private _grupoFuncionariosUrl: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._grupoFuncionariosUrl = '/api/fornecedor-grupos';
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._grupoFuncionariosUrl);
    }

    getAll(): Observable<FornecedorGrupoDTO[]> {
        return this._http.get<FornecedorGrupoDTO[]>(this._API_URL_ENDPOINT + this._grupoFuncionariosUrl);
    }

    getAllActive(): Observable<FornecedorGrupoDTO[]> {
        return this._http.get<FornecedorGrupoDTO[]>(
            this._API_URL_ENDPOINT + this._grupoFuncionariosUrl + '/all-active');
    }

    findByName(nome: string): Observable<FornecedorGrupoDTO[]> {
        return this._http.get<FornecedorGrupoDTO[]>(
            this._API_URL_ENDPOINT + this._grupoFuncionariosUrl + '/busca-nome/' + nome);
    }

    find(grupoFuncionario: FornecedorGrupoDTO): Observable<FornecedorGrupoDTO[]> {
        return this._http.post<FornecedorGrupoDTO[]>(
            this._API_URL_ENDPOINT + this._grupoFuncionariosUrl + '/busca',
            grupoFuncionario);
    }

    postOrPut(grupoFuncionario: FornecedorGrupoDTO, status: number): Observable<FornecedorGrupoDTO> {
        if (status === 1) {
            return this._http.post<FornecedorGrupoDTO>(
                this._API_URL_ENDPOINT + this._grupoFuncionariosUrl,
                grupoFuncionario,
            );
        } else {
            return this._http.put<FornecedorGrupoDTO>(
                this._API_URL_ENDPOINT + this._grupoFuncionariosUrl,
                grupoFuncionario,
            );
        }
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._grupoFuncionariosUrl + '/' + id);
    }

}
