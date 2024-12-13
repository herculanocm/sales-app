import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';
import { CustomHttpParamEncoder, GoogleGeometryCompleteReturn, UtilBodyPOST } from '../models/encoder.utils';
import { ClienteDTO, ClienteDividaComproLimiteSaldoDTO, ClientePesquisaDTO, PageCliente, VendedorResumoDTO } from '../models/cliente';


@Injectable()
export class ClienteService {
    private _API_URL_ENDPOINT: string;
    private _API_URL_ENDPOINT_NODEJS: string;
    private _FILE_DOWNLOAD_RESOURCE: string;
    private _url: string;
    private _urlFuncionarios: string;
    private _url_nodejs_find: string;
    private _url_checa_emissor: string;
    private _GOOGLE_API_KEY: string;
    private _GOOGLE_API_URL: string;
    private encode: CustomHttpParamEncoder;

    constructor(private _http: HttpClient) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._API_URL_ENDPOINT_NODEJS = sessionStorage.getItem('urlEndPointNodejs')!;
        this._url = '/api/clientes';
        this._urlFuncionarios = '/api/funcionarios';
        this._url_nodejs_find = '/api/clientes';
        this._url_checa_emissor = '/cliente-emissor/titulo-receber';
        this._FILE_DOWNLOAD_RESOURCE = sessionStorage.getItem('urlEndPointSales') + '/api/files';
        this._GOOGLE_API_KEY = environment.GOOGLE_API_KEY;
        this._GOOGLE_API_URL = environment.GOOGLE_API_URL;
        this.encode = new CustomHttpParamEncoder();
    }

    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }
    getAll(): Observable<ClienteDTO[]> {
        return this._http.get<ClienteDTO[]>(this._API_URL_ENDPOINT + this._url);
    }

    checaEmissor(id: number): Observable<any> {
        return this._http.get(this._API_URL_ENDPOINT + this._url + this._url_checa_emissor + '/' + id);
    }

    find(clientePesquisa: ClientePesquisaDTO): Observable<PageCliente> {
        return this._http.post<PageCliente>(this._API_URL_ENDPOINT + this._url + '/busca', clientePesquisa);
    }

    geraCSV(clientePesquisa: ClientePesquisaDTO): Observable<any> {
        return this._http.post<any>(this._API_URL_ENDPOINT + this._url + '/gera-csv', clientePesquisa);
    }

    donwloadCSV(id: number): Observable<Blob> {
        return this._http.get<Blob>(this._FILE_DOWNLOAD_RESOURCE +
            '/download/' + id, { responseType: 'blob' as 'json' });
    }

    findByName(nome: string): Observable<ClienteDTO[]> {
        return this._http.get<ClienteDTO[]>(this._API_URL_ENDPOINT + this._url + '/busca-nome/' + nome);
    }

    nodejsFindByName(nome: string): Observable<ClienteDTO[]> {
        return this._http.get<ClienteDTO[]>(this._API_URL_ENDPOINT_NODEJS + this._url_nodejs_find + '/nome/' + nome);
    }

    nodejsFindByFantasia(fantasia: string): Observable<ClienteDTO[]> {
        return this._http.get<ClienteDTO[]>(this._API_URL_ENDPOINT_NODEJS + this._url_nodejs_find + '/fantasia/' + fantasia);
    }

    findByNameResumo(nome: string): Observable<ClienteDTO[]> {
        return this._http.get<ClienteDTO[]>(this._API_URL_ENDPOINT + this._url + '/busca-nome-resumo/' + nome);
    }

    findByFantasiaResumo(nome: string): Observable<ClienteDTO[]> {
        return this._http.get<ClienteDTO[]>(this._API_URL_ENDPOINT + this._url + '/busca-fantasia-resumo/' + nome);
    }

    findById(id: number): Observable<ClienteDTO> {
        return this._http.get<ClienteDTO>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }

    findByCGC(cgc: string): Observable<ClienteDTO[]> {
        cgc = cgc.replace(/\D/g, '');
        return this._http.get<ClienteDTO[]>(this._API_URL_ENDPOINT + this._url + '/busca-cgc-resumo/' + cgc);
    }

    findLimiteDividaSaldoClienteByid(id: number): Observable<ClienteDividaComproLimiteSaldoDTO> {
        return this._http.get<ClienteDividaComproLimiteSaldoDTO>(this._API_URL_ENDPOINT_NODEJS + this._url_nodejs_find + '/limite-divida-saldo/' + id);
    }

    postOrPut(grupoFuncionario: ClienteDTO, status: number): Observable<ClienteDTO> {
        if (status === 1) {
            return this._http.post<ClienteDTO>(
                this._API_URL_ENDPOINT + this._url,
                grupoFuncionario,
            );
        } else {
            return this._http.put<ClienteDTO>(
                this._API_URL_ENDPOINT + this._url,
                grupoFuncionario,
            );
        }
    }

    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }

    getAllAcitveVendedores(): Observable<VendedorResumoDTO[]> {
        return this._http.get<VendedorResumoDTO[]>(this._API_URL_ENDPOINT + this._urlFuncionarios + '/busca-nome');
    }

    getLatLongByAddres(endereco: any): Observable<GoogleGeometryCompleteReturn> {
        // return this._http.get<any>(this._GOOGLE_API_URL + 'address=' + address + '&key=' + this._GOOGLE_API_KEY);
        return this._http.post<GoogleGeometryCompleteReturn>(this._API_URL_ENDPOINT + '/api/utils/latlong-address', endereco);
    }

    getLatLongByAddresString(utilBodyPost: UtilBodyPOST): Observable<GoogleGeometryCompleteReturn> {
        // return this._http.get<any>(this._GOOGLE_API_URL + 'address=' + address + '&key=' + this._GOOGLE_API_KEY);
        return this._http.post<GoogleGeometryCompleteReturn>(this._API_URL_ENDPOINT + '/utils/latlong-address/address', utilBodyPost);
    }

    getLatLongGoogleDirect(uri: string): Observable<GoogleGeometryCompleteReturn> {
        return this._http.get<GoogleGeometryCompleteReturn>(uri);
    }

    convertEndToStringURLGoogle(logradouro: string, numLogradouro: number,
        municipio: string, estado: string): string {
        let urlString = '';

        if (numLogradouro != null && numLogradouro > 0) {
            urlString += numLogradouro;
        }

        urlString += ' ' + logradouro;

        if (municipio != null && municipio.length > 0) {
            urlString += ',' + municipio;
        }

        if (estado != null && estado.length > 0) {
            urlString += ',' + estado;
        }

        urlString += '&components=country:BR';
        urlString = this.encode.encodeValue(urlString);
        urlString = this._GOOGLE_API_URL + 'address=' + urlString + '&key=' + this._GOOGLE_API_KEY;
        return urlString;
    }
}
