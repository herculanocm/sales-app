import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FuncionarioAux, FuncionarioDTO, FuncionarioPesquisaDTO, PageFuncionario } from '../models/funcionario';


@Injectable()
export class FuncionarioService {
    private _API_URL_ENDPOINT: string;
    private _API_URL_ENDPOINT_NODEJS: string;
    private _funcionariosUrl: string;
    private _buscaCep: string;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._API_URL_ENDPOINT_NODEJS = sessionStorage.getItem('urlEndPointNodejs')!;
        this._funcionariosUrl = '/api/funcionarios';
        this._buscaCep = '/busca-cep';
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._funcionariosUrl);
    }

    getById(id: number): Observable<FuncionarioDTO> {
        return this._http.get<FuncionarioDTO>(
            this._API_URL_ENDPOINT + this._funcionariosUrl + '/' + id);
    }

    getAll(): Observable<FuncionarioDTO[]> {
        return this._http.get<FuncionarioDTO[]>(this._API_URL_ENDPOINT + this._funcionariosUrl);
    }

    find(funcionarioPesquisa: FuncionarioPesquisaDTO): Observable<PageFuncionario> {
        return this._http.post<PageFuncionario>(
            this._API_URL_ENDPOINT + this._funcionariosUrl + '/busca',
            funcionarioPesquisa);
    }

    getAllActiveSupervisor(): Observable<FuncionarioDTO[]> {
        return this._http.get<FuncionarioDTO[]>(
            this._API_URL_ENDPOINT + this._funcionariosUrl + '/all-active/supervisores');
    }

    getAllActiveVendedor(): Observable<FuncionarioDTO[]> {
        return this._http.get<FuncionarioDTO[]>(
            this._API_URL_ENDPOINT + this._funcionariosUrl + '/all-active/vendedores');
    }

    getAllActiveVendedorByusername(username: string): Observable<FuncionarioAux[]> {
        return this._http.get<FuncionarioAux[]>(
            this._API_URL_ENDPOINT_NODEJS + '/api/funcionarios/vendedores/' + username);
    }

    getAllActiveConferente(): Observable<FuncionarioDTO[]> {
        return this._http.get<FuncionarioDTO[]>(
            this._API_URL_ENDPOINT + this._funcionariosUrl + '/all-active/conferentes');
    }
    getAllActiveMotoristas(): Observable<FuncionarioDTO[]> {
        return this._http.get<FuncionarioDTO[]>(
            this._API_URL_ENDPOINT + this._funcionariosUrl + '/all-active/motoristas');
    }
    getSupervisorByName(nome: string): Observable<FuncionarioDTO[]> {
        return this._http.get<FuncionarioDTO[]>(
            this._API_URL_ENDPOINT + this._funcionariosUrl + '/supervisores/busca-nome/' + nome);
    }

    getMotoristaByName(nome: string): Observable<FuncionarioDTO[]> {
        return this._http.get<FuncionarioDTO[]>(
            this._API_URL_ENDPOINT + this._funcionariosUrl + '/motoristas/busca-nome/' + nome);
    }

    getConferenteByName(nome: string): Observable<FuncionarioDTO[]> {
        return this._http.get<FuncionarioDTO[]>(
            this._API_URL_ENDPOINT + this._funcionariosUrl + '/conferentes/busca-nome/' + nome);
    }

    getVendedorByName(nome: string): Observable<FuncionarioDTO[]> {
        return this._http.get<FuncionarioDTO[]>(
            this._API_URL_ENDPOINT + this._funcionariosUrl + '/vendedores/busca-nome-resumo/' + nome);
    }

    postOrPut(grupoFuncionario: FuncionarioDTO, status: number): Observable<FuncionarioDTO> {
        if (status === 1) {
            return this._http.post<FuncionarioDTO>(
                this._API_URL_ENDPOINT + this._funcionariosUrl,
                grupoFuncionario,
            );
        } else {
            return this._http.put<FuncionarioDTO>(
                this._API_URL_ENDPOINT + this._funcionariosUrl,
                grupoFuncionario,
            );
        }
    }

    buscaCep(cep: string): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT + this._funcionariosUrl + this._buscaCep + '/' + cep);
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._funcionariosUrl + '/' + id);
    }

}
