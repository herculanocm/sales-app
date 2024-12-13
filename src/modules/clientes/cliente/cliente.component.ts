import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppClienteModalConfirmComponent } from '../modals/app-cliente-modal-confirm/app-cliente-modal-confirm.component';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'environments/environment';
import { CurrentUserLoged, EstadoDTO, MunicipioDTO } from '@modules/shared/models/layout.utils';
import { LayoutService } from '@modules/pages/services';
import { saveAs as importedSaveAs } from 'file-saver';
import { ClienteConsultaCreditoDTO, ClienteDTO, ClienteEmissorDTO, ClienteEnderecoDTO, ClienteGrupoDTO, ClienteLimiteDTO, ClientePesquisaDTO, ClienteSetorDTO, ClienteStatusDTO, ClienteStatusLabelDTO, ClienteVendedorDTO, PageCliente, SetorDTO, VendedorResumoDTO } from '@modules/shared/models/cliente';
import { ClienteCategoriaService, ClienteGrupoService, ClienteService, ClienteStatusLabelService, CondicaoPagamentoService, SetorService } from '@modules/shared/services';
import { CondicaoPagamentoDTO } from '@modules/shared/models/condicao-pagamento';

@Component({
    selector: 'app-cliente',
    templateUrl: './cliente.component.html',
    styleUrls: ['./cliente.component.scss'],
})
export class ClienteComponent implements OnInit {

    ColumnMode = ColumnMode;
    cliente!: ClienteDTO;
    // clientes: ClienteDTO[];
    endereco!: ClienteEnderecoDTO;
    enderecos!: ClienteEnderecoDTO[];
    clientePesquisa!: ClientePesquisaDTO;
    pageCliente!: PageCliente;
    grupoCliente!: ClienteGrupoDTO;
    grupoClientes!: ClienteGrupoDTO[];
    setores!: SetorDTO[];
    clienteStatusLabelIdSelecionado: number;
    clienteLimite!: ClienteLimiteDTO;
    clienteLimites!: ClienteLimiteDTO[];
    vendedores!: VendedorResumoDTO[];
    clienteVendedorDTO!: ClienteVendedorDTO;
    estados: EstadoDTO[] = [];
    municipios: MunicipioDTO[] = [];
    flgBuscandoMunicipio: number;
    clienteStatusLabel!: ClienteStatusLabelDTO;
    clienteStatusLabels!: ClienteStatusLabelDTO[];
    clienteConsultaCredito!: ClienteConsultaCreditoDTO;
    clienteEmissor!: ClienteEmissorDTO;
    condicaoPagamentoLabel!: CondicaoPagamentoDTO | null;
    condicaoPagamentoLabels!: CondicaoPagamentoDTO[];
    errorForm: any = {};
    authorities!: string[];
    grupoClienteSelected: any = {};
    currentUserSalesApp!: CurrentUserLoged;
    botaoGeraCSV!: string;
    activeNav: number;
    selectionTypeSingle = SelectionType.single;
    flgStatusAlteracaoLimite = 0;

    // status 1 = salvando, status 2 = editando, status 3 = pesquisando
    statusForm: number;
    foneMask = environment.foneMask;
    cellMask = environment.cellMask;
    cgcMask = environment.cgcMask;


    // datatable
    rows: any[] = [];
    columns: any[] = [
        { name: 'ID' },
        { name: 'NOME' },
        { name: 'STATUS' },
    ];

    selected: any[] = [];
    selectedClienteEmissor: any[] = [];
    selectedEndereco!: ClienteEnderecoDTO;
    selectedLimite!: ClienteLimiteDTO;
    selectedConsultaCredito!: ClienteConsultaCreditoDTO;
    selectedVendedor!: ClienteVendedorDTO;
    // datatable

    constructor(
        private spinner: NgxSpinnerService,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _modalService: NgbModal,
        private _clienteService: ClienteService,
        private _pagesService: LayoutService,
        private _grupoClienteService: ClienteGrupoService,
        private _setorService: SetorService,
        private _categoriaClienteService: ClienteCategoriaService,
        private _clienteStatusLabelService: ClienteStatusLabelService,
        private _condicaoPagamentoLabelService: CondicaoPagamentoService,
    ) {
        this.clienteStatusLabelIdSelecionado = 0;
        this.flgBuscandoMunicipio = 0;
        this.statusForm = 1;
        this.activeNav = 1;
    }

    searchingCategoria = false;
    searchFailedCategoria = false;
    hideSearchingWhenUnsubscribedCategoria = new Observable(() => () => this.searchingCategoria = false);

    searchingSetor = false;
    searchFailedSetor = false;
    hideSearchingWhenUnsubscribedSetor = new Observable(() => () => this.searchingSetor = false);

    searchingGrupo = false;
    searchFailedGrupo = false;
    hideSearchingWhenUnsubscribedGrupo = new Observable(() => () => this.searchingGrupo = false);

    searchingCidade = false;
    searchFailedCidade = false;
    hideSearchingWhenUnsubscribedCidade = new Observable(() => () => this.searchingCidade = false);

    formatterCategoria = (x: { nome: string }) => x.nome;
    formatterSetor = (x: { nome: string }) => x.nome;
    formatterGrupo = (x: { nome: string }) => x.nome;
    formatterCidade = (x: { nome: string }) => x.nome;

    verificaSetor(): void {
        if (this.cliente.clienteSetorDTO == null || !Object.prototype.hasOwnProperty.call(this.cliente.clienteSetorDTO, 'id')) {
            this.cliente.clienteSetorDTO = null;
            // console.log('nao existe supervisor');
        }
    }

    verificaCategoria(): void {
        if (this.cliente.clienteCategoriaDTO == null || !Object.prototype.hasOwnProperty.call(this.cliente.clienteCategoriaDTO, 'id')) {
            this.cliente.clienteCategoriaDTO = null;
            // console.log('nao existe supervisor');
        }
    }

    verificaGrupo(): void {
        if (this.grupoClienteSelected == null || !Object.prototype.hasOwnProperty.call(this.grupoClienteSelected, 'id')) {
            this.grupoClienteSelected = null;
            // console.log('nao existe supervisor');
        }
    }


    searchSetor = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.searchingSetor = true),
            switchMap(term =>
                this._setorService.findByName(term)
                    .pipe(
                        tap(() => this.searchFailedSetor = false),
                        catchError(() => {
                            this.searchFailedSetor = true;
                            return of([]);
                        })),
            ), tap(() => this.searchingSetor = false))

    searchCategoria = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.searchingCategoria = true),
            switchMap(term =>
                this._categoriaClienteService.findByName(term)
                    .pipe(
                        tap(() => this.searchFailedCategoria = false),
                        catchError(() => {
                            this.searchFailedCategoria = true;
                            return of([]);
                        })),
            ), tap(() => this.searchingCategoria = false))

    searchGrupo = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.searchingGrupo = true),
            switchMap(term =>
                this._grupoClienteService.findByName(term)
                    .pipe(
                        tap(() => this.searchFailedGrupo = false),
                        catchError(() => {
                            this.searchFailedGrupo = true;
                            return of([]);
                        })),
            ), tap(() => this.searchingGrupo = false))

    searchCidade = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.searchingCidade = true),
            switchMap(term =>
                this._pagesService.buscaMunicipiosResumo(term)
                    .pipe(
                        tap(() => this.searchFailedCidade = false),
                        catchError(() => {
                            this.searchFailedCidade = true;
                            return of([]);
                        })),
            ), tap(() => this.searchingCidade = false))



    removeSetor(): void {
        this.cliente.clienteSetorDTO = null;
    }

    isSetor(): boolean {
        return this.cliente.clienteSetorDTO != null
            && Object.prototype.hasOwnProperty.call(this.cliente.clienteSetorDTO, 'id') ? true : false;
    }

    /*
    isSetorVendedor(): boolean {
        return this.isSetor() && (this.cliente.clienteSetorDTO.hasOwnProperty('vendedorDTOs') &&
        this.cliente.clienteSetorDTO.vendedorDTOs.length > 0) ? true : false;
    }
    */

    removeCategoria(): void {
        this.cliente.clienteCategoriaDTO = null;
    }

    isCategoria(): boolean {
        return this.cliente.clienteCategoriaDTO != null
            && Object.prototype.hasOwnProperty.call(this.cliente.clienteCategoriaDTO, 'id') ? true : false;
    }
    grupoSelecionado(event: any, vGrupoSelecionado: any): void {
        this.grupoClienteSelected = event.item;
        this.addGrupo();
    }

    pop(tipo: string, titulo: string, msg: string): void {
        if (tipo === 'error') {
            this.toastr.error(msg, titulo);
        } else if (tipo === 'success') {
            this.toastr.success(msg, titulo);
        } else if (tipo === 'warning') {
            this.toastr.warning(msg, titulo);
        } else {
            this.toastr.info(msg, titulo);
        }
    }


    buscaCep(): void {
        this.pop('info','Buscando, aguarde...','');
        this._pagesService.buscaCep(this.endereco.cep)
            .subscribe((data) => {
                this.setaCep(data);
                this.cdr.detectChanges();
                this.pop('success','Encontrado com sucesso','');
            }, (err) => {
                this.pop('error', 'Erro', 'Digite um cep valido, erro ao pesquisar!.');
            });
    }

    buscaClienteStatusLabels(): void {
        this._clienteStatusLabelService.getAll()
            .subscribe((data) => {
                this.clienteStatusLabels = data;
                this.cdr.detectChanges();
            }, (err) => {
                this.pop('error', 'Erro', 'Erro ao buscar os labels de status, contate o administrador.');
            });
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
    }
    
    isUndefined(value: any): boolean {
        return typeof(value) === 'undefined';
    }

    buscaSetor(): void {
        this._setorService.buscaSetores()
            .subscribe((data) => {
                this.setores = data;
                this.setores.sort((v1, v2) => {
                    if (v1.nome < v2.nome) {
                        return -1;
                    }
                    if (v1.nome > v2.nome) {
                        return 1;
                    }
                    return 0;
                });
                this.cdr.detectChanges();
            }, (err) => {
                this.pop('error', 'Erro', 'Erro ao buscar setores, contate o administrador.');
            });
    }

    buscaCondicoesPagamentoLabels(): void {
        this._condicaoPagamentoLabelService.getAllActive()
            .subscribe((data) => {
                this.condicaoPagamentoLabels = data;
                this.condicaoPagamentoLabels.sort((v1, v2) => {
                    if (v1.nome < v2.nome) {
                        return -1;
                    }
                    if (v1.nome > v2.nome) {
                        return 1;
                    }
                    return 0;
                });
                this.cdr.detectChanges();
            }, (err) => {
                this.pop('error', 'Erro', 'Erro ao buscar os labels de condições, contate o administrador.');
            });
    }

    buscaEstados(): void {
        this._pagesService.buscaEstados()
            .subscribe((data) => {
                this.estados = data;
                // console.log(this.estados);
                this.cdr.detectChanges();
            }, (err) => {
                this.pop('error', 'Erro', 'Erro ao buscar estados, contate o administrador.');
            });
    }

    buscaMunicipiosPorEstado(estado: EstadoDTO): void {
        if (estado != null) {
            this.flgBuscandoMunicipio = 1;
            this._pagesService.buscaMunicipioPorEstado(estado.uf)
                .subscribe((data) => {
                    this.flgBuscandoMunicipio = 0;
                    this.municipios = data;
                    // console.log(this.municipios);
                    this.cdr.detectChanges();
                }, (err) => {
                    this.flgBuscandoMunicipio = 0;
                    this.pop('error', 'Erro', 'Erro ao buscar municipios, contate o administrador.');
                    this.cdr.detectChanges();
                });
        }
    }

    buscaMunicipios(): void {
        this._pagesService.buscaMunicipios()
            .subscribe((data) => {
                this.municipios = data;
                // console.log(this.municipios);
                this.cdr.detectChanges();
            }, (err) => {
                this.pop('error', 'Erro', 'Erro ao buscar municipios, contate o administrador.');
            });
    }

    buscaVendedores(): void {
        this.vendedores = [];
        this._clienteService.getAllAcitveVendedores()
            .subscribe((data) => {
                this.vendedores = this.filtraVendedorAtivo(data);
                this.vendedores.sort((v1, v2) => {
                    if (v1.nome < v2.nome) {
                        return -1;
                    }
                    if (v1.nome > v2.nome) {
                        return 1;
                    }
                    return 0;
                });
                this.cdr.detectChanges();
            }, (err) => {
                this.pop('error', 'Erro', 'Erro ao buscar vendedores, contate o administrador.');
            });
    }

    filtraVendedorAtivo(dados: VendedorResumoDTO[]): VendedorResumoDTO[] {
        return dados.filter(vend => {
            return vend.status === true && vend.indVendedor === true;
        });
    }

    excluiVendedor(): void {
        if (this.cliente.clienteVendedorDTOs.length > 0 && typeof (this.selectedVendedor) !== 'undefined' &&
            typeof (this.selectedVendedor.funcionarioDTO) !== 'undefined' && this.selectedVendedor.funcionarioDTO != null &&
            typeof (this.selectedVendedor.funcionarioDTO.id) !== 'undefined' && this.selectedVendedor.funcionarioDTO.id != null &&
            this.selectedVendedor.funcionarioDTO.id > 0) {
            for (let i = 0; i < this.cliente.clienteVendedorDTOs.length; i++) {
                if (this.selectedVendedor.funcionarioDTO.id === this.cliente.clienteVendedorDTOs[i].funcionarioDTO!.id) {
                    this.cliente.clienteVendedorDTOs.splice(i, 1);
                    i = this.cliente.clienteVendedorDTOs.length + 1;
                    this.cliente.clienteVendedorDTOs = [...this.cliente.clienteVendedorDTOs];
                    this.limparAddVendedores();
                }
            }
            this.cdr.detectChanges();
        } else {
            this.pop('error', 'Erro', 'Selecione um vendedor primeiro');
        }
    }

    atualizaStatus(): void {
        this.buscaClienteStatusLabels();
    }

    atualizaSetor(): void {
        this.buscaSetor();
    }

    atualizaCondicoes(): void {
        this.buscaCondicoesPagamentoLabels();
    }

    ngOnInit(): void {
        this.currentUserSalesApp = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);
        this.iniciaObjs();
        this.buscaUtils();
    }

    idDisable(): boolean {
        return this.statusForm === 2 ? true : false;
    }

    podeAlterarInput(nomeInput: string): boolean {

        const roles = this.currentUserSalesApp.user.authorityDTOs;
        const filtroAdmin = roles.filter(role => {
            return role.name === 'ROLE_ADMIN';
        });

        if (filtroAdmin.length > 0) {
            return false;
        } else if (nomeInput === 'cgcCliente') {
            return true;
        }
        return true;
    }

    podeAlterarTab(nomeTab: string): boolean {

        return true;
    }

    setaCep(data: any): void {
        this.endereco.cep = data.cep;
        this.endereco.logradouro = data.logradouro;
        this.endereco.bairro = data.bairro;
        this.endereco.cidade = data.cidade;
        this.endereco.estado = data.uf;
        this.endereco.numLogradouro = data.numLogradouro;
        this.endereco.complemento = data.complemento;
        this.endereco.uf = data.uf;
        this.endereco.municipioDTO = data.municipioDTO;
        this.municipios.push(this.endereco.municipioDTO);
    }

    setPage(pageInfo: any) {
        // console.log(pageInfo);
        this.clientePesquisa.pageSize = pageInfo.pageSize;
        this.clientePesquisa.pageNumber = pageInfo.offset;
        this.pesquisaCliente(this.clientePesquisa);
    }

    buscaUtils(): void {
        this.buscaClienteStatusLabels();
        this.buscaSetor();
        this.buscaCondicoesPagamentoLabels();
        this.buscaEstados();
        this.buscaVendedores();
    }


    addGrupo(): void {
        // console.log(this.grupoClienteSelected);
        if (this.grupoClienteSelected == null || typeof (this.grupoClienteSelected.id) === 'undefined') {
            this.pop('error', 'Erro', 'Selecione um grupo primeiro!.');
        } else {
            const filtros = this.cliente.clienteGrupoDTOs.filter(g => {
                return g.id === this.grupoClienteSelected.id;
            });

            if (filtros.length > 0) {
                this.pop('error', 'Erro', 'Grupo já foi adicionado!.');
            } else {
                this.cliente.clienteGrupoDTOs.push(this.grupoClienteSelected);
            }
        }
    }
    addCondicoes(): void {
        if (this.condicaoPagamentoLabel == null || typeof (this.condicaoPagamentoLabel.id) === 'undefined') {
            this.pop('error', 'Erro', 'Selecione uma condição de pagamento primeiro!.');
        } else {
            const filtros = this.cliente.condicaoPagamentoDTOs.filter(g => {
                return g.id === this.condicaoPagamentoLabel!.id;
            });

            if (filtros.length > 0) {
                this.pop('error', 'Erro', 'Condição já foi adicionada!.');
            } else {
                this.cliente.condicaoPagamentoDTOs.push(this.condicaoPagamentoLabel);
            }
        }
    }

    limparAddVendedores(): void {
        this.clienteVendedorDTO = new ClienteVendedorDTO();
        this.selectedVendedor = new ClienteVendedorDTO();
        this.selected = [];
    }

    addVendedores(): void {
        if (this.clienteVendedorDTO == null ||
            this.clienteVendedorDTO.funcionarioDTO == null ||
            typeof (this.clienteVendedorDTO.funcionarioDTO.id) === 'undefined') {
            this.pop('error', 'Erro', 'Selecione um vendedor primeiro!.');
        } else {
            const filtros = this.cliente.clienteVendedorDTOs.filter(g => {
                return g.funcionarioDTO!.id === this.clienteVendedorDTO.funcionarioDTO!.id;
            });

            if (filtros.length > 0) {
                this.pop('error', 'Erro', 'Vendedor já foi adicionada!.');
            } else {
                this.cliente.clienteVendedorDTOs.push(this.clienteVendedorDTO);
                this.cliente.clienteVendedorDTOs = [...this.cliente.clienteVendedorDTOs];
                this.clienteVendedorDTO = new ClienteVendedorDTO();
            }
        }
    }

    removeEndereco(cep: string): void {
        for (let i = 0; i < this.cliente.clienteEnderecoDTOs.length; i++) {
            if (this.cliente.clienteEnderecoDTOs[i].cep === cep) {
                this.cliente.clienteEnderecoDTOs.splice(i, 1);
                i = this.cliente.clienteEnderecoDTOs.length + 1;
                this.pop('success', 'OK', 'Endereço removido!');
            }
        }
    }
    removeGrupo(id: number): void {
        for (let i = 0; i < this.cliente.clienteGrupoDTOs.length; i++) {
            if (this.cliente.clienteGrupoDTOs[i].id === id) {
                this.cliente.clienteGrupoDTOs.splice(i, 1);
                i = this.cliente.clienteGrupoDTOs.length + 1;
                this.pop('success', 'OK', 'Grupo removido!');
            }
        }
    }

    removeCondicao(id: number): void {
        for (let i = 0; i < this.cliente.condicaoPagamentoDTOs.length; i++) {
            if (this.cliente.condicaoPagamentoDTOs[i].id === id) {
                this.cliente.condicaoPagamentoDTOs.splice(i, 1);
                i = this.cliente.condicaoPagamentoDTOs.length + 1;
                this.pop('success', 'OK', 'Grupo removido!');
            }
        }
    }

    onPesquisa(): void {
        this.clientePesquisa.clienteDTO = this.cliente;
        this.pesquisaCliente(this.clientePesquisa);
    }

    pesquisaCliente(clientePesquisa: ClientePesquisaDTO): void {
        this.selected = [];
        this.rows = [];

        this.spinner.show();
        this._clienteService.find(clientePesquisa)
            .subscribe((data) => {
                this.pageCliente = data;
                this.spinner.hide();

                this.pageCliente.content = this.atualizaContent(this.pageCliente.content);

                if (this.pageCliente.content.length === 0) {
                    this.pop('error', 'Pesquisa', 'Não foi encontrado nada com essa pesquisa.');
                } else if (this.pageCliente.content.length === 1) {
                    this.pop('success', 'Pesquisa', 'Encontrado apenas 1.');
                    this.cliente = this.pageCliente.content[0];
                    // console.log(this.cliente);
                    this.statusForm = 2;
                } else {
                    this.statusForm = 3;
                }
                this.cdr.detectChanges();
            }, (err) => {
                this.spinner.hide();
            });
    }

    atualizaContent(clientes: ClienteDTO[]): ClienteDTO[] {
        clientes.forEach(el => {

            el.qtdEndereco = el.clienteEnderecoDTOs.length;
            el.qtdVendedor = el.clienteVendedorDTOs.length;

            if (el.clienteEnderecoDTOs.length === 1) {
                el.clienteEnderecoDTO = el.clienteEnderecoDTOs[0];
            } else {
                const flg = el.clienteEnderecoDTOs.filter(en => {
                    return en.indPrioritario === true;
                });

                if (flg.length > 0) {
                    el.clienteEnderecoDTO = flg[0];
                } else {
                    el.clienteEnderecoDTO = el.clienteEnderecoDTOs[0];
                }
            }

            if (el.clienteVendedorDTOs.length > 0) {
                el.vendedor = el.clienteVendedorDTOs[0].funcionarioDTO!;
                el.vend = el.vendedor.nome;
            } else {
                el.vend = null;
            }
            el.endereco = el.clienteEnderecoDTO.municipioDTO.nome + ' - ' +
                el.clienteEnderecoDTO.bairro + ' - ' + el.clienteEnderecoDTO.logradouro;
        });
        return clientes;
    }

    getRowClass(row: any) {
        return {
            'datatable-row-class': 1 === 1,
        };
    }

    hasOwnPropertyObjetos(campo: string, obj: any): boolean {
        return Object.prototype.hasOwnProperty.call(obj, 'campo');
    }

    onDeleta(id: number): void {
        const activeModal = this._modalService.open(AppClienteModalConfirmComponent);
        activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
        activeModal.componentInstance.modalContent = 'Deseja realmente excluir ?';
        activeModal.componentInstance.modalType = 'confirm';
        activeModal.componentInstance.defaultLabel = 'Não';
        activeModal.result.then((result) => {
            if (result === 'confirm') {
                this.spinner.show();
                let message = '';
                this._clienteService.del(id)
                    .subscribe((resp: any) => {
                        this.spinner.hide();
                        message = resp.message;
                        this.rows = [];
                        // this.pop('success', 'Sucesso', message);
                        this.onLimpa();
                        this.cdr.detectChanges();
                    }, err => {
                        this.spinner.hide();
                        message = err.message;
                        this.pop('error', 'Erro', message);
                        this.cdr.detectChanges();
                    });
            }
        }, (error) => { console.log(error) });
    }

    onLimpa(): void {
        this.limpa();
    }

    voltar(): void {
        if (this.cliente.id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }

    limpa() {
        // console.log('limpando');
        this.iniciaObjs();
        this.buscaUtils();
        this.statusForm = 1;
        this.errorForm = {};
        this.selected = [];
        this.flgStatusAlteracaoLimite = 0;
    }

    alteradoStatusPeloSelect(): void {
        this.cliente.clienteStatusDTO.dtaInclusao = null;
        this.cliente.clienteStatusDTO.usuarioInclusao = null;
    }

    onLimpaEndereco(): void {

        this.endereco = new ClienteEnderecoDTO();
        this.selectedEndereco = new ClienteEnderecoDTO();

        this.endereco = new ClienteEnderecoDTO();
        this.endereco.municipioDTO = new MunicipioDTO();
        this.endereco.municipioDTO.id = -1;
        this.endereco.municipioDTO.estadoDTO = null;
        this.flgBuscandoMunicipio = 0;
    }

    onLimpaLimite(): void {
        this.clienteLimite = new ClienteLimiteDTO();
        this.selectedLimite = new ClienteLimiteDTO();
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.pageCliente.content.length; i++) {
                if (this.cliente.id === this.pageCliente.content[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.cliente = this.pageCliente.content[i - 1];
                        i = this.pageCliente.content.length + 1;
                        this.selected.push(this.cliente);
                    }
                }
            }
        }
    }

    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.pageCliente.content.length; i++) {
                if (this.cliente.id === this.pageCliente.content[i].id) {
                    if ((i + 1) < this.pageCliente.content.length) {
                        this.selected = [];
                        this.cliente = this.pageCliente.content[i + 1];
                        i = this.pageCliente.content.length + 1;
                        this.selected.push(this.cliente);
                    }
                }
            }
        }
    }

    onTable(): void {
        if (this.pageCliente != null && this.pageCliente.content != null && this.pageCliente.content.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Erro', 'Procure primeiro.');
        }
    }

    addLatLong(endereco: ClienteEnderecoDTO): void {
        // console.log(endereco);

        if (this.endereco.cep == null) {
            this.pop('error', 'Erro', 'O CEP não pode ser vazio');
        } else if (this.endereco.logradouro == null) {
            this.pop('error', 'Erro', 'O Logradouro não pode ser vazio');
        } else if (this.endereco.municipioDTO == null) {
            this.pop('error', 'Erro', 'A Cidade não pode ser vazia');
        } else {

            /*
            let strAddress = ((endereco.numLogradouro != null && endereco.numLogradouro > 0 ? endereco.numLogradouro : '') +
                ' ' + endereco.logradouro + ',' + endereco.municipioDTO.nome + ',' + endereco.municipioDTO.estadoDTO.nome + ',BRA');

            console.log(strAddress);

            strAddress = encodeURIComponent(strAddress);

            console.log(strAddress);
            */

            const uri = this._clienteService.convertEndToStringURLGoogle(endereco.logradouro, endereco.numLogradouro,
                endereco.municipioDTO.nome, endereco.municipioDTO.estadoDTO!.nome);
            // console.log(uri);

            this._clienteService.getLatLongGoogleDirect(uri)
                .subscribe((data) => {
                    // console.log(data);
                    if (data.status.toUpperCase() === 'OK') {
                        this.endereco.latitude = data.results[0].geometry.location.lat;
                        this.endereco.longitude = data.results[0].geometry.location.lng;
                        this.pop('success', 'OK', 'Encontrado com sucesso');
                    } else {
                        this.pop('warning', 'Atenção', 'Não foi encontrado, contate o administrador');
                    }
                    this.cdr.detectChanges();
                }, (error) => {
                    this.pop('error', 'Erro', 'Erro ao buscar, contate o administrador');
                });

            /*
            this._clienteService.getLatLongByAddres(endereco)
                .subscribe((data) => {
                    console.log(data);
                    if (data.status.toUpperCase() === 'OK') {
                        if (data.results.length === 1) {
                            this.endereco.latitude = data.results[0].geometry.location.lat;
                            this.endereco.longitude = data.results[0].geometry.location.lng;
                            this.pop('success', 'OK', 'Encontrado com sucesso');
                        } else if (data.results.length > 1) {
                            this.endereco.latitude = data.results[0].geometry.location.lat;
                            this.endereco.longitude = data.results[0].geometry.location.lng;
                            this.pop('warning', 'Atenção', 'Encontrado mais de um resultado, contate o administrador');
                        } else {
                            this.pop('warning', 'Atenção', 'Não foi encontrado nada no resultado, contate o administrador');
                        }
                    } else {
                        this.pop('warning', 'Atenção', 'Não foi encontrado, contate o administrador');
                    }
                }, (error) => {
                    this.pop('error', 'Erro', 'Erro ao buscar, contate o administrador');
                });
                */
        }
    }
    addEndereco(): void {
        // let flgAt = 0;

        if (this.endereco.cep == null) {
            this.pop('error', 'Erro', 'O CEP não pode ser vazio');
        } else if (this.endereco.logradouro == null) {
            this.pop('error', 'Erro', 'O Logradouro não pode ser vazio');
        } else if (this.endereco.municipioDTO == null) {
            this.pop('error', 'Erro', 'A Cidade não pode ser vazia');
        } else {
            // flgAt = 0;
            for (let i = 0; i < this.cliente.clienteEnderecoDTOs.length; i++) {
                if (this.cliente.clienteEnderecoDTOs[i].cep === this.endereco.cep) {
                    this.cliente.clienteEnderecoDTOs.splice(i, 1);
                    // flgAt = 1;
                    i = this.cliente.clienteEnderecoDTOs.length + 1;
                }
            }
            this.cliente.clienteEnderecoDTOs.push(this.endereco);
            this.cliente.clienteEnderecoDTOs = [...this.cliente.clienteEnderecoDTOs];
            this.endereco = new ClienteEnderecoDTO();

            this.endereco.municipioDTO = new MunicipioDTO();
            this.endereco.municipioDTO.id = -1;
            this.endereco.municipioDTO.estadoDTO = null;
            this.flgBuscandoMunicipio = 0;
        }
        this.cdr.detectChanges();
    }

    onDeletaLimite(): void {
        // this.deletaLimiteAdicionado();
        for (let i = 0; i < this.cliente.clienteLimiteHistoricoDTOs.length; i++) {
            if (this.cliente.clienteLimiteHistoricoDTOs[i].limite === this.clienteLimite.limite) {
                this.cliente.clienteLimiteHistoricoDTOs.splice(i, 1);
                i = this.cliente.clienteLimiteHistoricoDTOs.length + 1;
            }
        }


        this.onLimpaLimite();
        this.cliente.clienteLimiteHistoricoDTOs = [...this.cliente.clienteLimiteHistoricoDTOs];
        this.cdr.detectChanges();
    }

    onDeletaEndereco(): void {
        for (let i = 0; i < this.cliente.clienteEnderecoDTOs.length; i++) {
            if (this.cliente.clienteEnderecoDTOs[i].cep === this.endereco.cep) {
                this.cliente.clienteEnderecoDTOs.splice(i, 1);
                i = this.cliente.clienteEnderecoDTOs.length + 1;
            }
        }
        this.onLimpaEndereco();
        this.cliente.clienteEnderecoDTOs = [...this.cliente.clienteEnderecoDTOs];
        this.cdr.detectChanges();
    }
    onCadastra(): void {
        /*
                if (this.cliente.clienteLimiteDTO.limite !== this.cliente.clienteLimiteDTOAlteracao.limite) {
                    this.cliente.clienteLimiteDTO.desStatus = 'Novo';
                    this.cliente.clienteLimiteDTO.flgStatus = 1;
                    this.cliente.clienteLimiteDTO.id = null;
                }
        */
        this.spinner.show();
        // console.log(this.cliente);
        this._clienteService.postOrPut(this.cliente, this.statusForm)
            .subscribe((data) => {
                this.spinner.hide();
                this.cliente = data;
                this.errorForm = {};
                this.statusForm = 2;

                this.atualizaTable(this.cliente);
                this.cdr.detectChanges();
            }, (err) => {
                this.spinner.hide();
                if (Object.prototype.hasOwnProperty.call(err, 'error') && err.error != null) {
                    this.errorForm = err.error;
                }
                this.cdr.detectChanges();
            });
    }
    atualizaTable(clienteDTO: ClienteDTO): void {
        if (this.pageCliente != null && this.pageCliente.content != null &&
            this.pageCliente.content.length > 0) {
            for (let i = 0; i < this.pageCliente.content.length; i++) {
                if (clienteDTO.id === this.pageCliente.content[i].id) {
                    // console.log('atualizando');
                    this.pageCliente.content[i] = JSON.parse(JSON.stringify(clienteDTO));
                    this.pageCliente.content = [...this.pageCliente.content];
                }
            }
            this.pageCliente.content = this.atualizaContent(this.pageCliente.content);
        }
        this.cdr.detectChanges();
    }
    editando(): void {
        const sel: ClienteDTO[] = this.pageCliente.content.filter(us => {
            return us.id === this.selected[0].id;
        });
        this.cliente = sel[0];
        this.cliente.clienteEnderecoDTOs = [...this.cliente.clienteEnderecoDTOs];
        this.statusForm = 2;
        // console.log(this.cliente);
        this.cdr.detectChanges();
    }
    isValidDelete(): boolean {
        return this.statusForm === 2 && this.cliente.id != null ? false : true;
    }

    compareStatusLabel(c1: ClienteStatusLabelDTO, c2: ClienteStatusLabelDTO): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }

    compareSetores(c1: SetorDTO, c2: SetorDTO): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }

    compareEstado(c1: EstadoDTO, c2: EstadoDTO): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }

    compareMunicipio(c1: MunicipioDTO, c2: MunicipioDTO): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }

    addEmissor(): void {
        // console.log(this.clienteEmissor);

        const cgc = this.clienteEmissor.cgc != null &&
            this.clienteEmissor.cgc.length > 0 ? this.clienteEmissor.cgc.replace(/\D/g, '') : null;

        this.clienteEmissor.cgc = cgc!;

        // console.log(cgc);

        if (cgc == null || cgc.length < 11 || this.clienteEmissor.nome == null || this.clienteEmissor.nome.length <= 0) {
            this.pop('warning',
                'Atenção',
                'Adicione um nome e CGC válido');
        } else {
            const sel = this.cliente.clienteEmissorDTOs.filter(ce => {
                return ce.cgc === this.clienteEmissor.cgc;
            });

            if (sel.length > 0) {
                this.pop('warning',
                    'Atenção',
                    'CGC já adicionado, digite outro válido');
            } else {
                this.cliente.clienteEmissorDTOs.push(this.clienteEmissor);
                this.clienteEmissor = new ClienteEmissorDTO();
            }
        }
        this.selectedClienteEmissor = [];
        this.cliente.clienteEmissorDTOs = [...this.cliente.clienteEmissorDTOs];
        this.cdr.detectChanges();
    }
    addConsultaCredito(): void {

        const sel = this.cliente.clienteConsultaCreditoDTOs.filter(c => {
            return c.id === null;
        });

        const sel2 = this.cliente.clienteConsultaCreditoDTOs.filter(c => {
            return c.id === this.clienteConsultaCredito.id;
        });

        if (sel.length > 0) {
            this.pop('warning',
                'Atenção',
                'Consulta já adicionada, favor remover a adicionada');


        } else if (sel2.length > 0) {
            this.pop('warning',
                'Atenção',
                'Esta consulta é um historico e não pode ser adicionada, excluida ou modificada');
        } else {
            this.clienteConsultaCredito.id = null;
            this.clienteConsultaCredito.dtaInclusao = new Date();
            this.clienteConsultaCredito.usuarioInclusao = environment.getUser().username;
            this.clienteConsultaCredito.clienteDTO_id = this.cliente.id;
            this.cliente.clienteConsultaCreditoDTOs.push(this.clienteConsultaCredito);
            this.cliente.clienteConsultaCreditoDTOs = [...this.cliente.clienteConsultaCreditoDTOs];
            this.onLimpaConsultaCredito();
        }
        this.cdr.detectChanges();
    }

    onLimpaConsultaCredito(): void {
        this.clienteConsultaCredito = new ClienteConsultaCreditoDTO();
        this.selectedConsultaCredito = new ClienteConsultaCreditoDTO();
    }

    onLimpaEmissor(): void {
        this.selectedClienteEmissor = [];
        this.clienteEmissor = new ClienteEmissorDTO();
    }

    onDeletaConsultaCredito(): void {
        for (let i = 0; i < this.cliente.clienteConsultaCreditoDTOs.length; i++) {
            if (this.cliente.clienteConsultaCreditoDTOs[i].id === null) {
                this.cliente.clienteConsultaCreditoDTOs.splice(i, 1);
                i = this.cliente.clienteConsultaCreditoDTOs.length + 1;
            }
        }
        this.onLimpaConsultaCredito();
        this.cliente.clienteConsultaCreditoDTOs = [...this.cliente.clienteConsultaCreditoDTOs];
        this.cdr.detectChanges();
    }

    onDeletaEmissor(): void {
        if (this.clienteEmissor != null && this.clienteEmissor.id != null &&
            this.clienteEmissor.id > 0) {
            this._clienteService.checaEmissor(this.clienteEmissor.id)
                .subscribe((data) => {
                    if (data.existe === true) {
                        this.pop('warning', 'Atenção',
                            'Não é possivel excluir, pois o emitente está vinculado a um titulo.');
                    } else {
                        for (let i = 0; i < this.cliente.clienteEmissorDTOs.length; i++) {
                            if (this.cliente.clienteEmissorDTOs[i].cgc === this.clienteEmissor.cgc) {
                                this.cliente.clienteEmissorDTOs.splice(i, 1);
                                i = this.cliente.clienteEmissorDTOs.length + 1;
                                this.onLimpaEmissor();
                                this.cliente.clienteEmissorDTOs = [...this.cliente.clienteEmissorDTOs];
                                this.pop('success', 'Atenção', 'Removido com sucesso, salve para aplicar');
                            }
                        }
                    }
                    this.cdr.detectChanges();
                }, (error) => {
                    this.pop('error', 'Atenção', 'Não foi possivel excluir, servidor com erro.');
                });
        } else {
            for (let i = 0; i < this.cliente.clienteEmissorDTOs.length; i++) {
                if (this.cliente.clienteEmissorDTOs[i].cgc === this.clienteEmissor.cgc) {
                    this.cliente.clienteEmissorDTOs.splice(i, 1);
                    i = this.cliente.clienteEmissorDTOs.length + 1;
                    this.onLimpaEmissor();
                    this.cliente.clienteEmissorDTOs = [...this.cliente.clienteEmissorDTOs];
                    this.pop('success', 'Atenção', 'Removido com sucesso, salve para aplicar');
                }
            }
        }
    }

    alterandoLimite(): void {
        this.pop('warning',
            'Atenção',
            'Você está alterando o limite do cliente, para efetivar clique em salvar');
    }
    setaColumns(clientes: ClienteDTO[]): void {
        if (clientes.length === 1) {
            this.cliente = clientes[0];
            this.cliente.clienteEnderecoDTOs = [...this.cliente.clienteEnderecoDTOs];
            this.statusForm = 2;
        } else {
            for (let i = 0; i < clientes.length; i++) {
                this.rows.push(
                    {
                        id: clientes[i].id,
                        nome: clientes[i].nome,
                        status: clientes[i].clienteStatusDTO.clienteStatusLabelDTO!.label,
                    },
                );
            }
        }
    }

    iniciaObjs(): void {
        this.cliente = new ClienteDTO();
        this.cliente.clienteGrupoDTOs = [];
        this.cliente.clienteEnderecoDTOs = [];
        this.cliente.clienteStatusHistoricoDTOs = [];
        this.cliente.clienteLimiteHistoricoDTOs = [];
        this.cliente.condicaoPagamentoDTOs = [];
        this.cliente.clienteConsultaCreditoDTOs = [];
        this.cliente.clienteConsultaCreditoDTO = new ClienteConsultaCreditoDTO();
        this.cliente.clienteLimiteDTO = new ClienteLimiteDTO();
        this.cliente.clienteStatusDTO = new ClienteStatusDTO();
        this.cliente.clienteSetorDTO = new ClienteSetorDTO();
        this.cliente.clienteSetorHistoricoDTOs = [];
        this.cliente.clienteVendedorDTOs = [];
        this.cliente.clienteEmissorDTOs = [];
        this.endereco = new ClienteEnderecoDTO();
        this.clienteLimite = new ClienteLimiteDTO();
        this.selectedEndereco = new ClienteEnderecoDTO();
        this.selectedLimite = new ClienteLimiteDTO;
        this.selectedConsultaCredito = new ClienteConsultaCreditoDTO();
        this.clienteConsultaCredito = new ClienteConsultaCreditoDTO();
        this.clienteEmissor = new ClienteEmissorDTO();
        this.selectedVendedor = new ClienteVendedorDTO();
        this.condicaoPagamentoLabel = null;
        this.clientePesquisa = new ClientePesquisaDTO();

        this.municipios = [];
        this.estados = [];
        this.setores = [];
        this.endereco.municipioDTO = new MunicipioDTO();
        this.endereco.municipioDTO.id = -1;
        this.endereco.municipioDTO.estadoDTO = null;
        this.flgBuscandoMunicipio = 0;

        this.clienteVendedorDTO = new ClienteVendedorDTO();
        this.vendedores = [];

        this.botaoGeraCSV = 'Gerar CSV';
    }

    isDisableDeleteClienteEmissor(): boolean {
        if (this.selectedClienteEmissor == null || this.selectedClienteEmissor.length === 0 || this.selectedClienteEmissor[0].cgc == null) {
            return true;
        } else {
            return false;
        }
    }

    geraCSV(): void {
        this.botaoGeraCSV = 'Gerando CSV';
        this._clienteService.geraCSV(this.clientePesquisa)
            .subscribe((data) => {
                // console.log(data);
                // console.log('realizando download do arquivo');
                this.cdr.detectChanges();
                const fileName = data.fileName;
                this.botaoGeraCSV = 'Gerando! Baixando CSV';
                this._clienteService.donwloadCSV(data.id)
                    .subscribe((respData) => {
                        // console.log('subscribe');
                        // console.log(data);
                        // console.log(respData);
                        this.botaoGeraCSV = 'Gerar CSV';
                        const dataBlob = [respData];
                        const file = new Blob(dataBlob, { type: 'text/plain;charset=utf-8' });
                        importedSaveAs(file, fileName);
                        // var fileUrl = window.URL.createObjectURL(file);

                        // console.log('abrindo janela');

                        // window.open(fileUrl);

                        // console.log(fileUrl);
                        this.cdr.detectChanges();
                    }, (err) => {
                        this.botaoGeraCSV = 'Gerar CSV';
                        this.cdr.detectChanges();
                        // console.log(err);
                    });
            }, (err) => {
                this.botaoGeraCSV = 'Gerar CSV';
                // console.log(err);
                this.cdr.detectChanges();
            });
    }

    getEndereco(row: ClienteDTO): string {
        return (row.clienteEnderecoDTO.municipioDTO.nome + ' - ' +
            row.clienteEnderecoDTO.bairro + ' - ' + row.clienteEnderecoDTO.logradouro);
    }

    getQtdEndereco(row: ClienteDTO): number {
        return row.clienteEnderecoDTOs.length;
    }

    getQtdVendedor(row: ClienteDTO): number {
        return row.clienteVendedorDTOs.length;
    }

    getVendedor(row: ClienteDTO): string {
        return row.vendedor.nome;
    }

    onSelectEndereco({ selected }: any) {
        // console.log('Select Event onSelectEndereco', selected, this.selected);
        this.selectedEndereco = selected[0];
        this.endereco = selected[0];
        this.municipios.push(this.endereco.municipioDTO);
    }

    onSelectVendedor({ selected }: any) {
        this.selectedVendedor = selected[0];
    }

    onSelectLimite({ selected }: any) {
        // console.log('Select Event onSelectEndereco', selected, this.selected);
        this.selectedLimite = selected[0];
        this.clienteLimite = selected[0];
    }

    onSelectEmissor({ selected }: any) {
        this.clienteEmissor = selected[0];
    }

    onSelectConsultaCredito({ selected }: any) {
        this.selectedConsultaCredito = selected[0];
        this.clienteConsultaCredito = selected[0];
    }

    onActivate(event: any) {
        if (
            (event.type === 'dblclick') ||
            (event.type === 'keydown' && event.event.keyCode === 13)
        ) {
            this.editando();
        }
    }
}
