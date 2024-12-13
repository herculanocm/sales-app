import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FuncionarioGrupoDTO } from '../models/funcionario';

@Injectable()
export class FuncionarioGrupoService {
    private _API_URL_ENDPOINT: string;
    private _grupoFuncionariosUrl: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._grupoFuncionariosUrl = '/api/funcionario-grupos';
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._grupoFuncionariosUrl);
    }

    getAll(): Observable<FuncionarioGrupoDTO[]> {
        return this._http.get<FuncionarioGrupoDTO[]>(this._API_URL_ENDPOINT + this._grupoFuncionariosUrl);
    }

    getAllActive(): Observable<FuncionarioGrupoDTO[]> {
        return this._http.get<FuncionarioGrupoDTO[]>(
            this._API_URL_ENDPOINT + this._grupoFuncionariosUrl + '/all-active');
    }

    findByName(nome: string): Observable<FuncionarioGrupoDTO[]> {
        return this._http.get<FuncionarioGrupoDTO[]>(
            this._API_URL_ENDPOINT + this._grupoFuncionariosUrl + '/busca-nome/' + nome);
    }

    find(grupoFuncionario: FuncionarioGrupoDTO): Observable<FuncionarioGrupoDTO[]> {
        return this._http.post<FuncionarioGrupoDTO[]>(
            this._API_URL_ENDPOINT + this._grupoFuncionariosUrl + '/busca',
            grupoFuncionario);
    }

    postOrPut(grupoFuncionario: FuncionarioGrupoDTO, status: number): Observable<FuncionarioGrupoDTO> {
        if (status === 1) {
            return this._http.post<FuncionarioGrupoDTO>(
                this._API_URL_ENDPOINT + this._grupoFuncionariosUrl,
                grupoFuncionario,
            );
        } else {
            return this._http.put<FuncionarioGrupoDTO>(
                this._API_URL_ENDPOINT + this._grupoFuncionariosUrl,
                grupoFuncionario,
            );
        }
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._grupoFuncionariosUrl + '/' + id);
    }

}
