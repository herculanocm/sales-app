import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageMap } from '@ngx-pwa/local-storage';
import { CheckListVeiculoDTO, CheckListVeiculoImageDTO, CheckListVeiculoItemDTO, CheckListVeiculoPesquisaDTO, PageCheckListVeiculo } from '../models/generic';
import { VeiculoDTO } from '../models/veiculo';
import { FuncionarioDTO } from '../models/funcionario';

@Injectable()
export class CheckListVeiculoService {
    private _API_URL_ENDPOINT: string;
    private _API_URL_ENDPOINT_NODEJS: string;
    private _url: string;
    constructor(private _http: HttpClient,
        private storage: StorageMap,
    ) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._API_URL_ENDPOINT_NODEJS = sessionStorage.getItem('urlEndPointNodejs')!;
        this._url = '/api/checklist-veiculo';
    }
    storageSet(chave: string, valor: any): Observable<any> {
        return this.storage.set(chave, valor);
    }
    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }
    find(checkListVeiculoPesquisaDTO: CheckListVeiculoPesquisaDTO): Observable<PageCheckListVeiculo> {
        return this._http.post<PageCheckListVeiculo>(this._API_URL_ENDPOINT + this._url + '/busca', checkListVeiculoPesquisaDTO);
    }
    findItemActive(): Observable<CheckListVeiculoItemDTO[]> {
        return this._http.get<CheckListVeiculoItemDTO[]>(this._API_URL_ENDPOINT + '/api/checklist-veiculo-service-item-active');
    }
    postOrPut(checkListVeiculoDTO: CheckListVeiculoDTO, status: number): Observable<CheckListVeiculoDTO> {
        if (status === 1) {
            return this._http.post<CheckListVeiculoDTO>(
                this._API_URL_ENDPOINT + this._url,
                checkListVeiculoDTO,
            );
        } else {
            return this._http.put<CheckListVeiculoDTO>(
                this._API_URL_ENDPOINT + this._url,
                checkListVeiculoDTO,
            );
        }
    }
    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }
    findVeiculosAtivos(): Observable<VeiculoDTO[]> {
        return this._http.get<VeiculoDTO[]>(this._API_URL_ENDPOINT + '/api/veiculos/all-active');
    }
    findMotoristasAtivos(): Observable<FuncionarioDTO[]> {
        return this._http.get<FuncionarioDTO[]>(this._API_URL_ENDPOINT + '/api/funcionarios/all-active/motoristas');
    }
    findCheckListVeiculoItem(): Observable<CheckListVeiculoItemDTO[]> {
        return this._http.get<CheckListVeiculoItemDTO[]>(this._API_URL_ENDPOINT + '/api/checklist-veiculo-service-item-active');
    }
    postImagem(it: CheckListVeiculoImageDTO): Observable<CheckListVeiculoImageDTO> {
        return this._http.post<CheckListVeiculoImageDTO>(this._API_URL_ENDPOINT + '/api/checklist-veiculo-image', it);
    }
    getImages(idChecklist: number): Observable<CheckListVeiculoImageDTO[]> {
        return this._http.get<CheckListVeiculoImageDTO[]>(this._API_URL_ENDPOINT_NODEJS + '/api/checklist/imagens/' + idChecklist);
    }
    delImage(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + '/api/checklist-veiculo-image/' + id);
    }
    isHashContext(): boolean {
        return window.location.href.toString().indexOf('#') === -1 ? false : true;
    }

    hrefContext(): string {
        let href = window.location.href.toString();
        if (this.isHashContext() === true) {
            href = href.substring(0, href.indexOf('#') - 1);
            href = href + '/#/';
        } else {
            href = href.substring(0, href.indexOf('/', 8));
            href = href + '/';
        }
        return href;
    }
}
