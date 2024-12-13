import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageMap } from '@ngx-pwa/local-storage';
import { FaturarVendaReturn, ItemPAv, PageVenda, PesqVendaArrayBody, RomaneioEntrega, VendaDTO, VendaPesquisaDTO, VendaRotaStatus, VendaStatusDTO, VendaStatusLabelDTO, VendaStatusMotivoDTO } from '../models/venda';
import { BodyPostIds, BuscaReport, FormItensReport, IndicadoresVendaAux, ItemCliente, MesAnoFiltros, ReportItensAgrupado, RequestServerJust, RetornoClientes, RetornoItens, RetornoPedidos, RetornoStatus, TopItensCliente, VendasRepre } from '../models/generic';
import { ItemGrupo, ItemGrupoDTO, ItemMarcaDTO, ItensAux } from '../models/item';



@Injectable()
export class VendaService {
    private _API_URL_ENDPOINT: string;
    private _API_URL_ENDPOINT_NODEJS: string;
    private _url: string;
    private _urlUtils: string;
    private _urlPesAvNodejs: string;
    private _urlPermitVendas: string;
    private _url_item_Nodejs: string;
    private _url_venda_status_label: string;

    constructor(
        private _http: HttpClient,
        private storage: StorageMap,
    ) {
        this._API_URL_ENDPOINT = sessionStorage.getItem('urlEndPointSales')!;
        this._API_URL_ENDPOINT_NODEJS = sessionStorage.getItem('urlEndPointNodejs')!;
        this._url = '/api/vendas';
        this._urlUtils = '/api/utils/data-atual';
        this._urlPesAvNodejs = '/api/clientes/pesq-av';
        this._urlPermitVendas = '/api/vendas/permit-venda';
        this._url_item_Nodejs = '/api/itens';
        this._url_venda_status_label = '/api/venda-status-labels';
    }
    storageSet(chave: string, valor: any): Observable<any> {
        return this.storage.set(chave, valor);
    }
    getDataAtualServidor(): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT + this._urlUtils);
    }
    getUrl(): Observable<object> {
        return this._http.get(this._API_URL_ENDPOINT + this._url);
    }
    del(id: number): Observable<string> {
        return this._http.delete<string>(this._API_URL_ENDPOINT + this._url + '/' + id);
    }
    find(vendaPesquisa: VendaPesquisaDTO): Observable<PageVenda> {
        return this._http.post<PageVenda>(this._API_URL_ENDPOINT + this._url + '/busca', vendaPesquisa);
    }
    find2(vendaPesquisa: VendaPesquisaDTO): Observable<PageVenda> {
        return this._http.post<PageVenda>(this._API_URL_ENDPOINT + this._url + '/busca2', vendaPesquisa);
    }
    postFaturarMultiplasVendas(bodypost: BodyPostIds): Observable<FaturarVendaReturn> {
        return this._http.post<FaturarVendaReturn>(this._API_URL_ENDPOINT + this._url + '/faturar-multiplas', bodypost);
    }
    findById(idVenda: number): Observable<VendaDTO> {
        return this._http.get<VendaDTO>(this._API_URL_ENDPOINT + this._url + '/' + idVenda);
    }
    findAllVendasByIds(ids: PesqVendaArrayBody): Observable<VendaDTO[]> {
        return this._http.post<VendaDTO[]>(this._API_URL_ENDPOINT + this._url + '/find-multiply', ids);
    }
    findAllVendasByIdsNode(ids: PesqVendaArrayBody): Observable<VendaDTO[]> {
        return this._http.post<VendaDTO[]>(this._API_URL_ENDPOINT_NODEJS +'/api/v2/venda', ids);
    }
    findClientePesAv(pesqAv: any): Observable<any> {
        return this._http.post(this._API_URL_ENDPOINT_NODEJS + this._urlPesAvNodejs, pesqAv);
    }
    findItemPesAv(pesqAv: any): Observable<ItemPAv[]> {
        return this._http.post<ItemPAv[]>(this._API_URL_ENDPOINT_NODEJS + this._url_item_Nodejs + '/pesq-av', pesqAv);
    }
    findItemPesAvV2(pesqAv: any): Observable<ItemPAv[]> {
        return this._http.post<ItemPAv[]>(this._API_URL_ENDPOINT_NODEJS + '/api/v2/itens/pesq-av', pesqAv);
    }
    isPermitVenda(id: number): Observable<any> {
        return this._http.get(this._API_URL_ENDPOINT_NODEJS + this._urlPermitVendas + '/' + (id != null && id > 0 ? id : -1));
    }
    getVendaStatusLabels(): Observable<VendaStatusLabelDTO[]> {
        return this._http.get<VendaStatusLabelDTO[]>(this._API_URL_ENDPOINT + this._url_venda_status_label);
    }
    getMesAnoFiltros(): Observable<MesAnoFiltros[]> {
        return this._http.get<MesAnoFiltros[]>(this._API_URL_ENDPOINT_NODEJS + '/api/v2/mes-ano-filtros');
    }
    postConfirmaVenda(requestServerJust: RequestServerJust): Observable<VendaDTO> {
        if (requestServerJust.justificativa == null || requestServerJust.justificativa === ''
            || requestServerJust.justificativa.trim() === '' || requestServerJust.justificativa.trim().length === 0) {
            requestServerJust.justificativa = null;
        }
        return this._http.post<VendaDTO>(this._API_URL_ENDPOINT + this._url + '/confirmar', requestServerJust);
    }
    postValidaVenda(requestServerJust: RequestServerJust): Observable<VendaDTO> {
        if (requestServerJust.justificativa == null || requestServerJust.justificativa === ''
            || requestServerJust.justificativa.trim() === '' || requestServerJust.justificativa.trim().length === 0) {
            requestServerJust.justificativa = null;
        }
        return this._http.post<VendaDTO>(this._API_URL_ENDPOINT + this._url + '/validar', requestServerJust);
    }
    postAprovaVenda(requestServerJust: RequestServerJust): Observable<VendaDTO> {
        if (requestServerJust.justificativa == null || requestServerJust.justificativa === ''
            || requestServerJust.justificativa.trim() === '' || requestServerJust.justificativa.trim().length === 0) {
            requestServerJust.justificativa = null;
        }
        return this._http.post<VendaDTO>(this._API_URL_ENDPOINT + this._url + '/aprovar', requestServerJust);
    }
    findRomaneioEntregas(idAux: any[]): Observable<RomaneioEntrega[]> {
        return this._http.post<RomaneioEntrega[]>(this._API_URL_ENDPOINT_NODEJS + '/api/romaneio/resumo-entrega', {ids: idAux});
    }
    postDesconfirmarVenda(requestServerJust: RequestServerJust): Observable<VendaDTO> {
        if (requestServerJust.justificativa == null || requestServerJust.justificativa === ''
            || requestServerJust.justificativa.trim() === '' || requestServerJust.justificativa.trim().length === 0) {
            requestServerJust.justificativa = null;
        }
        return this._http.post<VendaDTO>(this._API_URL_ENDPOINT + this._url + '/desconfirmar', requestServerJust);
    }
    postFaturarVenda(requestServerJust: RequestServerJust): Observable<VendaDTO> {
        if (requestServerJust.justificativa == null || requestServerJust.justificativa === ''
            || requestServerJust.justificativa.trim() === '' || requestServerJust.justificativa.trim().length === 0) {
            requestServerJust.justificativa = null;
        }
        return this._http.post<VendaDTO>(this._API_URL_ENDPOINT + this._url + '/faturar', requestServerJust);
    }
    postDesFaturarVenda(requestServerJust: RequestServerJust): Observable<VendaDTO> {
        if (requestServerJust.justificativa == null || requestServerJust.justificativa === ''
            || requestServerJust.justificativa.trim() === '' || requestServerJust.justificativa.trim().length === 0) {
            requestServerJust.justificativa = null;
        }
        return this._http.post<VendaDTO>(this._API_URL_ENDPOINT + this._url + '/desfaturar', requestServerJust);
    }

    assumirCaixa(prevendaId: number): Observable<VendaDTO> {
        return this._http.get<VendaDTO>(this._API_URL_ENDPOINT + this._url + '/assumir-caixa/' + prevendaId);
    }

    marcarCarregado(requestServerJust: RequestServerJust): Observable<VendaDTO> {
        if (requestServerJust.justificativa == null || requestServerJust.justificativa === ''
            || requestServerJust.justificativa.trim() === '' || requestServerJust.justificativa.trim().length === 0) {
            requestServerJust.justificativa = null;
        }
        return this._http.post<VendaDTO>(this._API_URL_ENDPOINT + this._url + '/marcar-carregado', requestServerJust);
    }

    marcarAguardandoCarregamento(requestServerJust: RequestServerJust): Observable<VendaDTO> {
        if (requestServerJust.justificativa == null || requestServerJust.justificativa === ''
            || requestServerJust.justificativa.trim() === '' || requestServerJust.justificativa.trim().length === 0) {
            requestServerJust.justificativa = null;
        }
        return this._http.post<VendaDTO>(this._API_URL_ENDPOINT + this._url + '/marcar-aguardando-carregamento', requestServerJust);
    }

    postCancelaVenda(requestServerJust: RequestServerJust): Observable<VendaDTO> {
        if (requestServerJust.justificativa == null || requestServerJust.justificativa === ''
            || requestServerJust.justificativa.trim() === '' || requestServerJust.justificativa.trim().length === 0) {
            requestServerJust.justificativa = null;
        }
        return this._http.post<VendaDTO>(this._API_URL_ENDPOINT + this._url + '/cancelar', requestServerJust);
    }
    postOrPut(vendaDTO: VendaDTO, status: number): Observable<VendaDTO> {
        if (status === 1) {
            return this._http.post<VendaDTO>(
                this._API_URL_ENDPOINT + this._url,
                vendaDTO,
            );
        } else {
            return this._http.put<VendaDTO>(
                this._API_URL_ENDPOINT + this._url,
                vendaDTO,
            );
        }
    }

    postCupomFiscal(vendaDTO: VendaDTO): Observable<VendaDTO> {
        return this._http.post<VendaDTO>(
            this._API_URL_ENDPOINT + '/api/vendas-cupom',
            vendaDTO,
        );
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

    buscaReportStatus(busca: BuscaReport): Observable<RetornoStatus[]> {
        return this._http.post<RetornoStatus[]>(this._API_URL_ENDPOINT_NODEJS + '/api/vendas/report/status', busca);
    }

    buscaReportStatusItens(busca: BuscaReport): Observable<RetornoStatus[]> {
        return this._http.post<RetornoStatus[]>(this._API_URL_ENDPOINT_NODEJS + '/api/vendas/report/status-itens', busca);
    }

    buscaReportClientes(busca: BuscaReport): Observable<RetornoClientes[]> {
        return this._http.post<RetornoClientes[]>(this._API_URL_ENDPOINT_NODEJS + '/api/vendas/report/clientes', busca);
    }

    buscaReportItens(busca: BuscaReport): Observable<RetornoItens[]> {
        return this._http.post<RetornoItens[]>(this._API_URL_ENDPOINT_NODEJS + '/api/vendas/report/itens', busca);
    }

    buscaReportPedidos(busca: BuscaReport): Observable<RetornoPedidos[]> {
        return this._http.post<RetornoPedidos[]>(this._API_URL_ENDPOINT_NODEJS + '/api/vendas/report/detalhado', busca);
    }
    buscaReportRepresentantes(busca: BuscaReport): Observable<VendasRepre[]> {
        return this._http.post<VendasRepre[]>(this._API_URL_ENDPOINT_NODEJS + '/api/vendas/report/supervisor', busca);
    }
    buscaTitulosPercClienteV1(idCliente: number): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT + '/api/titulo-recebers/perc-cliente/' + idCliente);
    }
    buscaTitulosPercAtrasoCliente(idCliente: number): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT +
            '/api/titulo-recebers/perc-atraso-cliente/' + idCliente);
    }
    buscaTitulosPorIdCliente(idCliente: number): Observable<any> {
        return this._http.get<any>(this._API_URL_ENDPOINT + '/api/titulo-recebers/cliente/' + idCliente);
    }
    buscaItensAuxAllActiveNode(): Observable<ItensAux[]> {
        return this._http.get<ItensAux[]>(this._API_URL_ENDPOINT_NODEJS + '/api/itens/all-active-aux');
    }
    buscaReportItensAgrupado(busca: FormItensReport): Observable<ReportItensAgrupado[]> {
        return this._http.post<ReportItensAgrupado[]>(this._API_URL_ENDPOINT_NODEJS + '/api/vendas/report/item-agrupado', busca);
    }
    buscaTopItensCliente(clienteId: number, vendedorId: number): Observable<TopItensCliente[]> {
        return this._http.post<TopItensCliente[]>(this._API_URL_ENDPOINT_NODEJS +
            '/api/vendas/cliente/top-itens', { clienteId: clienteId, vendedorId: vendedorId });
    }
    buscaTopItensCliente2(clienteId: number, mesano: number | undefined): Observable<TopItensCliente[]> {
        return this._http.post<TopItensCliente[]>(this._API_URL_ENDPOINT_NODEJS +
            '/api/vendas/cliente/top-itens2', { clienteId: clienteId, mesano: mesano });
    }
    buscaTodosItemGrupos(): Observable<ItemGrupoDTO[]> {
        return this._http.get<ItemGrupoDTO[]>(this._API_URL_ENDPOINT_NODEJS + '/api/itens/all-active-grupos');
    }
    buscaItensDoGrupo(formPesq: object): Observable<ItemGrupo[]> {
        return this._http.post<ItemGrupo[]>(this._API_URL_ENDPOINT_NODEJS + '/api/itens/item-grupo-venda', formPesq);
    }
    buscaItemClientesGrupo(formPesq: object): Observable<ItemCliente[]> {
        return this._http.post<ItemCliente[]>(this._API_URL_ENDPOINT_NODEJS + '/api/itens/item-grupo-cliente', formPesq);
    }
    buscaTodasMarcas(): Observable<ItemMarcaDTO[]> {
        return this._http.get<ItemMarcaDTO[]>(this._API_URL_ENDPOINT_NODEJS + '/api/itens/all-active-marcas');
    }
    buscaTodosMotivos(): Observable<VendaStatusMotivoDTO[]> {
        return this._http.get<VendaStatusMotivoDTO[]>(this._API_URL_ENDPOINT_NODEJS + '/api/vendas/venda-status-motivos');
    }
    getVendasAprovacaoSuperior(): Observable<VendaDTO[]> {
        return this._http.get<VendaDTO[]>(this._API_URL_ENDPOINT + this._url + '/aprovacao-superior');
    }
    getUltStatusConfirmacao(vendaDTO: VendaDTO): VendaStatusDTO | null {
        if (vendaDTO.vendaStatusAtualDTO == null ||
            vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AB'
        ) {
            return null;
        } else {
            const filt = vendaDTO.vendaStatusDTOs.filter(vs => {
                return vs.vendaStatusLabelDTO.sigla === 'CF';
            });

            filt.sort((c1, c2) => {
                if (c1.dtaInclusao < c2.dtaInclusao) {
                    return 1;
                }
                if (c1.dtaInclusao > c2.dtaInclusao) {
                    return -1;
                }
                return 0;
            });

            return filt.length === 0 ? null : filt[0];
        }
    }
    getUltStatusFaturado(vendaDTO: VendaDTO): VendaStatusDTO | null {
        if (vendaDTO.vendaStatusAtualDTO == null ||
            vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AB' ||
            vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AAE' ||
            vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AE' ||
            vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AAF' ||
            vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AF' ||
            vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AFA' ||
            vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'FCC') {
            return null;
        } else {
            const filt = vendaDTO.vendaStatusDTOs.filter(vs => {
                return vs.vendaStatusLabelDTO.sigla === 'FA';
            });

            filt.sort((c1, c2) => {
                if (c1.dtaInclusao < c2.dtaInclusao) {
                    return 1;
                }
                if (c1.dtaInclusao > c2.dtaInclusao) {
                    return -1;
                }
                return 0;
            });

            return filt.length === 0 ? null : filt[0];
        }
    }
    getUltStatusAprovado(vendaDTO: VendaDTO): VendaStatusDTO | null {
        if (vendaDTO.vendaStatusAtualDTO == null ||
            vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AB' ||
            vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AAE' ||
            vendaDTO.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'AAF') {
            return null;
        } else {
            const filt = vendaDTO.vendaStatusDTOs.filter(vs => {
                return vs.vendaStatusLabelDTO.sigla === 'AE' || vs.vendaStatusLabelDTO.sigla === 'AF';
            });

            filt.sort((c1, c2) => {
                if (c1.dtaInclusao < c2.dtaInclusao) {
                    return 1;
                }
                if (c1.dtaInclusao > c2.dtaInclusao) {
                    return -1;
                }
                return 0;
            });

            return filt.length === 0 ? null : filt[0];
        }
    }
    getStatusVendaRota(dtaEmissao: string, vendedorId: number): Observable<VendaRotaStatus[]> {
        return this._http.post<VendaRotaStatus[]>(this._API_URL_ENDPOINT_NODEJS +
            '/api/vendas/rota-status', { dtaEmissao: dtaEmissao, vendedorId: vendedorId });
    }

    getIndicadoresVenda(dtaInicialPesquisa: string, dtaFinalPesquisa: string, vendedorId: number): Observable<IndicadoresVendaAux[]> {
        return this._http.post<IndicadoresVendaAux[]>(this._API_URL_ENDPOINT_NODEJS + '/api/reports/indicadores/venda', {
            dtaEmissaoInicial: dtaInicialPesquisa,
            dtaEmissaoFinal: dtaFinalPesquisa,
            vendedorId: vendedorId
        });
    }
}
