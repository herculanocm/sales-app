import { Component, OnInit, ElementRef, ViewChild, Renderer2, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { saveAs as importedSaveAs } from 'file-saver';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppMovimentoModalConfirmComponent } from '../modals/app-mov-modal-confirm/app-mov-modal-confirm.component';
import { Router } from '@angular/router';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserLoged } from '@modules/shared/models/layout.utils';
import { ItemEstoqueStatus, MovimentoDTO, MovimentoItemDTO, MovimentoOrigemDTO, MovimentoPesquisaDTO, MovimentoTipoDTO, PageMovimento } from '@modules/shared/models/movimento';
import { ClienteDTO } from '@modules/shared/models/cliente';
import { FornecedorDTO } from '@modules/shared/models/fornecedor';
import { FuncionarioDTO } from '@modules/shared/models/funcionario';
import { VeiculoDTO } from '@modules/shared/models/veiculo';
import { EstoqueAlmoxarifadoDTO, ItemDTO, ItemResumoDTO, ItemUnidadeDTO } from '@modules/shared/models/item';
import { UserDTO } from '@modules/shared/models/usuario';
import { ClienteService, EstoqueAlmoxarifadoService, FornecedorService, FuncionarioService, ItemService, MovimentoService, MovimentoTipoService, UsuarioService } from '@modules/shared/services';
import { VeiculoService } from '@modules/veiculos/veiculo/veiculo.service';

@Component({
    selector: 'app-movimento',
    templateUrl: './movimento.component.html',
    styleUrls: ['./movimento.component.scss'],
})
export class MovimentoComponent implements OnInit, AfterViewInit {
    ColumnMode = ColumnMode;
    @ViewChild('inputIdCodItem') inputIdCodItem!: ElementRef;
    currentUserSalesApp!: CurrentUserLoged;
    movimento!: MovimentoDTO;
    pageMovimento!: PageMovimento;
    movimentoPesquisaDTO!: MovimentoPesquisaDTO;
    movimentoTipos!: MovimentoTipoDTO[];
    movimentoOrigens!: MovimentoOrigemDTO[];
    clienteSelecionado!: ClienteDTO;
    fornecedorSelecionado!: FornecedorDTO;
    motoristas!: FuncionarioDTO[];
    conferentes!: FuncionarioDTO[];
    veiculos!: VeiculoDTO[];
    almoxarifados!: EstoqueAlmoxarifadoDTO[];
    itemProcura!: ItemDTO;
    movimentoItem!: MovimentoItemDTO;
    selectedItemMovimento!: MovimentoItemDTO;
    usuarios!: UserDTO[];
    itemResumoDTO!: ItemResumoDTO;
    errorForm: any = {};
    currentJustify = 'center';
    itemEstoqueStatus!: ItemEstoqueStatus;
    public loading = false;
    registerForm!: FormGroup;
    formPesquisa!: FormGroup;
    botaoGeraCSV!: string;
    rows: any[] = [];
    temp: any[] = [];
    selectionTypeSingle = SelectionType.single;
    @ViewChild('origemId') origemId: ElementRef | undefined;

    /* Searching variables */
    searchingItem!: boolean;
    searchFailedItem!: boolean;

    searchingCliente!: boolean;
    searchFailedCliente!: boolean;

    searchingFornecedor!: boolean;
    searchFailedFornecedor!: boolean;

    searchingMotorista!: boolean;
    searchFailedMotorista!: boolean;

    searchingConferente!: boolean;
    searchFailedConferente!: boolean;

    // status 1 = salvando, status 2 = editando, status 3 = pesquisando
    statusForm!: number;
    columns: any[] = [
        { name: 'ID' },
        { name: 'NOME' },
        { name: 'STATUS' },
        { name: 'OUTRO' },
    ];
    selected: any[] = [];
    selectedMovItem: any[] = [];

    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _modalService: NgbModal,
        private _movimentoService: MovimentoService,
        private _movimentoTipoService: MovimentoTipoService,
        private _veiculoService: VeiculoService,
        private _clienteService: ClienteService,
        private _fornecedorService: FornecedorService,
        private _funcionarioService: FuncionarioService,
        private _itemService: ItemService,
        private _estoqueAlmoxarifadoService: EstoqueAlmoxarifadoService,
        private _usuarioService: UsuarioService,
        private spinner: NgxSpinnerService,
        private router: Router,
        // tslint:disable-next-line: deprecation
        private renderer: Renderer2,
    ) { }
    ngOnInit() {
        this.currentUserSalesApp = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);
        console.log(this.currentUserSalesApp);
        this.searchingItem = false;
        this.searchFailedItem = false;
        this.searchingCliente = false;
        this.searchFailedCliente = false;
        this.searchingFornecedor = false;
        this.searchFailedFornecedor = false;
        this.searchingMotorista = false;
        this.searchFailedMotorista = false;
        this.searchingConferente = false;
        this.searchFailedConferente = false;
        this.botaoGeraCSV = 'Gerar CSV';
        this.statusForm = 1;
        this.buscaMovimentoOrigens();
        this.buscaMovimentoTipos();
        this.buscaVeiculos();
        this.buscaAlmoxarifados();
        this.buscaConferentes();
        this.buscaMotoristas();
        this.buscaUsuarios();
        this.iniciaObjs();
    }

    ngAfterViewInit() {
        this.origemId!.nativeElement.focus();
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
    }
    
    isUndefined(value: any): boolean {
        return typeof(value) === 'undefined';
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

    tooltipBtnSalvar(): string {
        if (this.statusForm === 2 && this.isMovimentoDifCompleto()) {
            return 'Somente movimento completo e de rota pode ser atualizado';
        } else if (this.statusForm === 2 && this.isDisableAtualizarMovimento()) {
            return 'Você está sem permissão para atualiar movimento';
        } else if (this.statusForm === 2) {
            return 'Botão de atualizar movimento';
        } else if (this.statusForm === 1 && this.isDisableSalvarMovimento()) {
            return 'Você está sem permissão para salvar movimento';
        } else {
            return 'Botão de salvar movimento';
        }
    }

    isDisableSalvaAtualiza(): boolean {
        if (this.statusForm === 2 && this.isMovimentoDifCompleto() &&
        this.isMovimentoDifRota()) {
            return true;
        } else if (this.statusForm === 2 && this.isDisableAtualizarMovimento()) {
            return true;
        } else if (this.statusForm === 2) {
            return false;
        } else if (this.statusForm === 1 && this.isDisableSalvarMovimento()) {
            return true;
        } else {
            return false;
        }
    }
    isDisableSalvarMovimento(): boolean {
        const flt = this.currentUserSalesApp.user.authorityDTOs.filter(auth => {
            return auth.name === 'ROLE_SALES_MOVIMENTO_SALVAR';
        });
        return flt.length > 0 ? false : true;
    }

    isDisableAtualizarMovimento(): boolean {
        const flt = this.currentUserSalesApp.user.authorityDTOs.filter(auth => {
            return auth.name === 'ROLE_SALES_MOVIMENTO_ATUALIZAR';
        });
        return flt.length > 0 ? false : true;
    }

    isMovimentoDifCompleto(): boolean {
        return this.movimento != null
            && this.movimento.movimentoOrigemDTO != null
            && this.movimento.movimentoOrigemDTO.id != null
            && this.movimento.movimentoOrigemDTO.id > 1 ? true : false;
    }

    isMovimentoDifRota(): boolean {
        return this.movimento != null
            && this.movimento.movimentoOrigemDTO != null
            && this.movimento.movimentoOrigemDTO.id != null
            && this.movimento.movimentoOrigemDTO.id != 7 ? true : false;
    }

    isDisableDeletarMovimento(): boolean {
        const flt = this.currentUserSalesApp.user.authorityDTOs.filter(auth => {
            return auth.name === 'ROLE_SALES_MOVIMENTO_DELETAR';
        });
        return flt.length > 0 ? false : true;
    }

    isValidDelete(): boolean {
        if (this.isDisableDeletarMovimento()) {
            return false;
        } else if (this.isMovimentoDifCompleto() && this.isMovimentoDifRota()) {
            return false;
        } else if (this.statusForm !== 2 || this.movimento == null || this.movimento.id == null) {
            return false;
        } else if (this.statusForm === 2 && this.movimento != null && this.movimento.id != null && this.movimento.id > 0) {
            return true;
        } else {
            return false;
        }
    }

    isDisableDeleteMovimentoItem(): boolean {
        if (this.selectedItemMovimento.status == 'novo' ||
            (this.movimento != null &&
                this.movimento.movimentoOrigemDTO != null &&
                this.movimento.movimentoOrigemDTO.id === 7)
        ) {
            return false;
        } else {
            return true;
        }
    }

    tooltipBtnDeletar(): string {
        if (this.isDisableDeletarMovimento()) {
            return 'Você está sem permissão para deletar movimento';
        } else if (this.isMovimentoDifCompleto() && this.isMovimentoDifRota()) {
            return 'Somente movimento completo e de rota pode ser deletado';
        } else if (this.statusForm !== 2 || this.movimento == null || this.movimento.id == null) {
            return 'Selecione um movimento válido para deleção';
        } else if (this.statusForm === 2 && this.movimento != null && this.movimento.id != null && this.movimento.id > 0) {
            return 'Clicando aqui você irá deletar o movimento';
        } else {
            return 'Sem capacidade para deletar';
        }
    }

    getVlrMedio(): number {
        if (this.movimentoItem != null
            && this.movimentoItem.qtd != null
            && this.movimentoItem.valor != null
            && this.movimentoItem.itemUnidadeDTO != null) {
            return (this.movimentoItem.valor / (this.movimentoItem.qtd * this.movimentoItem.itemUnidadeDTO.fator));
        }
        return 0;
    }

    /* formatter */
    formatterItem = (x: { nome: string }) => x.nome;
    formatterCliente = (x: { nome: string }) => x.nome;
    formatterFornecedor = (x: { nome: string }) => x.nome;
    formatterMotorista = (x: { nome: string }) => x.nome;
    formatterConferente = (x: { nome: string }) => x.nome;

    verificaCliente(): void {
        if (this.searchFailedCliente === true && this.clienteSelecionado != null
            && this.clienteSelecionado.nome != null
            && this.clienteSelecionado.nome.length >= 0) {
            this.searchFailedCliente = false;
            this.clienteSelecionado = new ClienteDTO();
        }
    }
    verificaFornecedor(): void {
        if (this.searchFailedFornecedor === true && this.fornecedorSelecionado != null
            && this.fornecedorSelecionado.nome != null
            && this.fornecedorSelecionado.nome.length >= 0) {
            this.searchFailedFornecedor = false;
            this.fornecedorSelecionado = new FornecedorDTO();
        }
    }

    /* is */
    isCliente(): boolean {
        return this.movimento.clienteDTO != null
            && Object.prototype.hasOwnProperty.call(this.movimento.clienteDTO,'id') 
            && Object.prototype.hasOwnProperty.call(this.movimento.clienteDTO,'clienteStatusDTO') ? true : false;
    }

    isMovimentoTipo(): boolean {
        return Object.prototype.hasOwnProperty.call(this.movimento,'movimentoTipoDTO') 
            && this.movimento.movimentoTipoDTO != null
            && this.movimento.movimentoTipoDTO.id > 0 ? true : false;
    }

    isFornecedor(): boolean {
        return this.movimento.fornecedorDTO != null
            && Object.prototype.hasOwnProperty.call(this.movimento.fornecedorDTO,'id') 
            && Object.prototype.hasOwnProperty.call(this.movimento.fornecedorDTO,'status') 
            && this.movimento.fornecedorDTO.status === true ? true : false;
    }

    isMotorista(): boolean {
        return this.movimento.motoristaDTO != null
            && Object.prototype.hasOwnProperty.call(this.movimento.motoristaDTO,'id')
            && Object.prototype.hasOwnProperty.call(this.movimento.motoristaDTO,'status')
            && this.movimento.motoristaDTO.status === true ? true : false;
    }

    isConferente(): boolean {
        return this.movimento.conferenteDTO != null
            && Object.prototype.hasOwnProperty.call(this.movimento.conferenteDTO,'id')
            && Object.prototype.hasOwnProperty.call(this.movimento.conferenteDTO,'status')
            && this.movimento.conferenteDTO.status === true ? true : false;
    }

    /* Serach Observable */
    searchItem = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.searchingItem = true),
            switchMap(term =>
                this._itemService.findByName(term)
                    .pipe(
                        tap(() => this.searchFailedItem = false),
                        catchError(() => {
                            this.searchFailedItem = true;
                            return of([]);
                        })),
            ), tap(() => this.searchingItem = false))

    searchCliente = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.searchingCliente = true),
            switchMap(term =>
                this._clienteService.findByName(term)
                    .pipe(
                        tap(() => this.searchFailedCliente = false),
                        catchError(() => {
                            this.searchFailedCliente = true;
                            return of([]);
                        })),
            ), tap(() => this.searchingCliente = false))

    searchFornecedor = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.searchingFornecedor = true),
            switchMap(term =>
                this._fornecedorService.findByName(term)
                    .pipe(
                        tap(() => this.searchFailedFornecedor = false),
                        catchError(() => {
                            this.searchFailedFornecedor = true;
                            return of([]);
                        })),
            ), tap(() => this.searchingFornecedor = false))

    searchConferente = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.searchingConferente = true),
            switchMap(term =>
                this._funcionarioService.getConferenteByName(term)
                    .pipe(
                        tap(() => this.searchFailedConferente = false),
                        catchError(() => {
                            this.searchFailedConferente = true;
                            return of([]);
                        })),
            ), tap(() => this.searchingConferente = false))


    searchMotorista = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.searchingMotorista = true),
            switchMap(term =>
                this._funcionarioService.getMotoristaByName(term)
                    .pipe(
                        tap(() => this.searchFailedMotorista = false),
                        catchError(() => {
                            this.searchFailedMotorista = true;
                            return of([]);
                        })),
            ), tap(() => this.searchingMotorista = false))



    onDeleta(id: number): void {
        const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
        activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
        activeModal.componentInstance.modalContent = 'Deseja realmente excluir ?';
        activeModal.componentInstance.modalType = 'confirm';
        activeModal.componentInstance.defaultLabel = 'Não';
        activeModal.result.then((result) => {
            if (result === 'confirm') {
                let message = '';
                this._movimentoService.del(id)
                    .subscribe((resp: any) => {
                        // this.loading = false;
                        message = resp.message;
                        this.pop('success', 'Sucesso', message);
                        this.onLimpa();
                        this.cdr.detectChanges();
                    }, err => {
                        // this.loading = false;
                        message = err.message;
                        this.pop('error', 'Erro', message);
                        this.cdr.detectChanges();
                    });
            }
        }, (error) => { console.log(error) });
    }


    onPesquisa(): void {
        this.movimentoPesquisaDTO.movimentoDTO = this.movimento;
        this.pesquisaMovimento(this.movimentoPesquisaDTO);
    }

    isActiveAlx(): boolean {
        if (this.movimento == null ||
            this.movimento.estoqueAlmoxarifadoDTO == null ||
            this.movimento.estoqueAlmoxarifadoDTO.id == null) {
            return false;
        } else {
            return true;
        }
    }

    isItemProcura(): boolean {
        if (this.itemProcura != null && this.itemProcura.id != null
            && this.itemProcura.itemUnidadeDTOs != null && this.itemProcura.itemUnidadeDTOs.length > 0
            && this.itemProcura.id > 0) {
            return true;
        } else {
            return false;
        }
    }

    pesquisaMovimento(movPesquisa: MovimentoPesquisaDTO): void {
        this.selected = [];
        this.rows = [];
        // this.loading = true;

        // console.log(movPesquisa);

        this.spinner.show();
        this._movimentoService.find(movPesquisa)
            .subscribe((data) => {
                const pageData = data;
                // console.log(pageData);
                /*
                for (let i = 0; i < pageData.content.length; i++) {
                    pageData.content[i] = this.verificaEntidadesMovimento(pageData.content[i]);
                }
                */
                pageData.content = pageData.content.sort((obj1, obj2) => {
                    if (obj1.id > obj2.id) {
                        return 1;
                    }
                    if (obj1.id < obj2.id) {
                        return -1;
                    }
                    return 0;
                });
                this.pageMovimento = pageData;
                // this.loading = false;
                this.spinner.hide();
                if (this.pageMovimento.content.length === 0) {
                    this.pop('error', 'Pesquisa', 'Não foi encontrado nada com essa pesquisa.');
                } else if (this.pageMovimento.content.length === 1) {
                    this.pop('success', 'Pesquisa', 'Encontrado apenas 1.');
                    this.setaMovimento(this.pageMovimento.content[0]);
                    this.statusForm = 2;
                } else {
                    this.statusForm = 3;
                    // this.setaColumns(this.pageMovimento.content);
                }
                this.cdr.detectChanges();
            }, (err) => {
                // this.loading = false;
                // console.log(err);
                this.spinner.hide();
                this.cdr.detectChanges();
            });
    }



    geraCSV(): void {
        this.botaoGeraCSV = 'Gerando CSV';
        this._movimentoService.geraCSV(this.movimentoPesquisaDTO)
            .subscribe((data) => {
                this.cdr.detectChanges();
                // console.log(data);
                // console.log('realizando download do arquivo');
                const fileName = data.fileName;
                this.botaoGeraCSV = 'Gerando! Baixando CSV';
                this._movimentoService.donwloadCSV(data.id)
                    .subscribe((respData) => {
                        this.cdr.detectChanges();
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
                        // console.log(err);
                        this.cdr.detectChanges();
                    });
            }, (err) => {
                this.botaoGeraCSV = 'Gerar CSV';
                this.cdr.detectChanges();
                // console.log(err);
            });
    }

    openUrl(): void {
        window.open();
    }

    downloadCSV(id: number): void {
        this._movimentoService.donwloadCSV(id)
            .subscribe((data) => {
                this.cdr.detectChanges();
                // console.log(data);
            }, (err) => {
                // console.log(err);
            });
    }
    downloadZip(id: number): void {
        // console.log('realizando download do arquivo');
        this._movimentoService.donwloadCSV(id)
            .subscribe((data) => {
                // console.log('subscribe');
                // console.log(data);
                const file = new Blob([data], { type: 'text/csv' });

                const fileUrl = window.URL.createObjectURL(file);

                // console.log('abrindo janela');

                window.open(fileUrl);

                // console.log(fileUrl);
                this.cdr.detectChanges();
            }, (err) => {
                // console.log(err);
            });
    }

    setPage(pageInfo: any) {
        // console.log(pageInfo);
        this.movimentoPesquisaDTO.pageSize = pageInfo.pageSize;
        this.movimentoPesquisaDTO.pageNumber = pageInfo.offset;
        this.pesquisaMovimento(this.movimentoPesquisaDTO);
    }
    serverIsError(): boolean {
        return this.errorForm != null && this.errorForm.message != null ? true : false;
    }

    onCadastra(): void {
        this.spinner.show();
        // console.log(this.movimento);
        this._movimentoService.postOrPut(this.movimento, this.statusForm)
            .subscribe((data) => {
                this.spinner.hide();
                this.setaMovimento(data);
                delete this.errorForm;
                this.statusForm = 2;
                this.rows = [];
                this.cdr.detectChanges();
            }, (err) => {
                this.spinner.hide();
                if (Object.prototype.hasOwnProperty.call(err, 'error') && err.error != null) {
                    this.errorForm = err.error;
                }
                this.cdr.detectChanges();
            });
    }

    verificaEntidadesMovimento(movimento: MovimentoDTO): MovimentoDTO {
        if (movimento.motoristaDTO == null) {
            movimento.motoristaDTO = new FuncionarioDTO();
        }
        if (movimento.conferenteDTO == null) {
            movimento.conferenteDTO = new FuncionarioDTO();
        }
        if (movimento.clienteDTO == null) {
            movimento.clienteDTO = new ClienteDTO();
        }
        if (movimento.fornecedorDTO == null) {
            movimento.fornecedorDTO = new FornecedorDTO();
        }
        return movimento;
    }

    mensagemAlerta(titulo: string, content: string, type: string): void {
        const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
        activeModal.componentInstance.modalHeader = titulo;
        activeModal.componentInstance.modalContent = content;
        activeModal.componentInstance.modalType = 'alert';
        activeModal.componentInstance.defaultLabel = 'Ok';
        activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
    }

    selectedItem(event: any) {

        this._itemService.findById(event.item.id)
            .subscribe((resp: any) => {
                this.itemProcura = resp;
                this.selectedItemId(null, this.itemProcura.id);
                this.cdr.detectChanges();
            }, err => {
                this.pop('error', 'ERRO', 'Erro ao buscar o Item.');
                this.cdr.detectChanges();
            });

    }
    selectedItemId(event: any, idItem: number): void {

        this._itemService.findById(idItem)
            .subscribe((resp) => {

                if (resp.movimentoBloqueado === true) {
                    const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
                    activeModal.componentInstance.modalHeader = 'ATENÇAO';
                    activeModal.componentInstance.modalContent = 'O item '
                        + resp.nome + ' está bloqueado para lançamento de movimentos, contate o responsável';
                    activeModal.componentInstance.modalType = 'error';
                    activeModal.componentInstance.defaultLabel = 'Ok';
                    activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });

                } else {
                    this.itemProcura.itemUnidadeDTOs = [];
                    this.itemProcura = JSON.parse(JSON.stringify(resp));
                    this.movimentoItem.itemDTO = JSON.parse(JSON.stringify(resp));
                    let alx: EstoqueAlmoxarifadoDTO | null;

                    if (this.isActiveAlx()) {
                        alx = this.movimento.estoqueAlmoxarifadoDTO;
                    } else {
                        const sel = this.almoxarifados.filter(alxf => {
                            return alxf.id === 2;
                        });
                        if (sel.length > 0) {
                            alx = sel[0];
                        } else {
                            alx = this.almoxarifados[0];
                        }
                    }

                    this.getItemSaldoEstoque(alx!, this.itemProcura.id);
                }
                this.cdr.detectChanges();
            }, err => {
                this.pop('error', 'ERRO', 'Erro ao buscar o item, revise o codigo digitado');
                this.cdr.detectChanges();
            });
    }

    selectedFornecedor(event: any): void {
        this._fornecedorService.findById(event.item.id)
            .subscribe((data) => {
                this.setFornecedor(data);
                this.cdr.detectChanges();
            }, (err) => {
                this.pop('error', 'Erro', 'Erro ao buscar o Fornecedor por typeahead');
                this.cdr.detectChanges();
            });
    }
    selectFornecedorByCod(cod: number): void {
        if (cod != null && cod > 0) {
            this._fornecedorService.findById(cod)
                .subscribe((data) => {
                    this.setFornecedor(data);
                    this.cdr.detectChanges();
                }, (err) => {
                    this.pop('error', 'Erro', 'Erro ao buscar o Fornecedor por esse codigo');
                    this.cdr.detectChanges();
                });
        } else {
            this.pop('error', 'Erro', 'Digite um codigo maior do que 0 para o Fornecedor');
            this.cdr.detectChanges();
        }
    }
    selectMotoristaByCod(cod: number): void {
        if (cod != null && cod > 0) {
            this._funcionarioService.getById(cod)
                .subscribe((data) => {
                    this.setMotorista(data);
                    this.cdr.detectChanges();
                }, (err) => {
                    this.pop('error', 'Erro', 'Erro ao buscar o Motorista por esse codigo');
                    this.cdr.detectChanges();
                });
        } else {
            this.pop('error', 'Erro', 'Digite um codigo maior do que 0 para o Motorista');
        }
    }

    selectConferenteByCod(cod: number): void {
        if (cod != null && cod > 0) {
            this._funcionarioService.getById(cod)
                .subscribe((data) => {
                    this.setConferente(data);
                    this.cdr.detectChanges();
                }, (err) => {
                    this.pop('error', 'Erro', 'Erro ao buscar o Conferente por esse codigo');
                    this.cdr.detectChanges();
                });
        } else {
            this.pop('error', 'Erro', 'Digite um codigo maior do que 0 para o Conferente');
        }
    }

    selectClienteByCod(cod: number): void {
        if (cod != null && cod > 0) {
            this._clienteService.findById(cod)
                .subscribe((data) => {
                    this.setCliente(data);
                    this.cdr.detectChanges();
                }, (err) => {
                    this.pop('error', 'Erro', 'Erro ao buscar o cliente por esse codigo');
                    this.cdr.detectChanges();
                });
        } else {
            this.pop('error', 'Erro', 'Digite um codigo maior do que 0 para o Cliente');
        }
    }

    selectedCliente(event: any): void {
        this._clienteService.findById(event.item.id)
            .subscribe((data) => {
                this.setCliente(data);
                this.cdr.detectChanges();
            }, (err) => {
                this.pop('error', 'Erro', 'Erro ao buscar o cliente depois do typeahead');
                this.cdr.detectChanges();
            });
    }

    typeaHeadSelectCliente(event: any): void {
        // console.log('print typeahead cliente');
        // console.log(event);
        this.selectedCliente(event);
        this.cdr.detectChanges();
    }

    setCliente(cliente: ClienteDTO): void {
        if (cliente.clienteStatusDTO.clienteStatusLabelDTO!.isMovimentoBloqueado) {
            const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
            activeModal.componentInstance.modalHeader = 'Atenção';
            activeModal.componentInstance.modalContent = 'Cliente informado está bloqueado para lançamento de movimento';
            activeModal.componentInstance.modalType = 'error';
            activeModal.componentInstance.defaultLabel = 'Ok';
            activeModal.result.then((result) => {
                this.resetaCliente();
                this.cdr.detectChanges();
            }, (error) => {
                this.resetaCliente();
                this.cdr.detectChanges();
            });
        } else {
            this.searchFailedCliente = false;
            this.clienteSelecionado = JSON.parse(JSON.stringify(cliente));
            this.movimento.clienteDTO = JSON.parse(JSON.stringify(cliente));
            this.cdr.detectChanges();
        }
    }

    setFornecedor(fornecedor: FornecedorDTO): void {
        if (!fornecedor.status) {
            const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
            activeModal.componentInstance.modalHeader = 'Atenção';
            activeModal.componentInstance.modalContent = 'Fornecedor informado está inativo';
            activeModal.componentInstance.modalType = 'error';
            activeModal.componentInstance.defaultLabel = 'Ok';
            activeModal.result.then((result) => {
                this.resetaFornecedor();
                this.cdr.detectChanges();
            }, (error) => {
                this.resetaFornecedor();
                this.cdr.detectChanges();
            });
        } else {
            this.searchFailedFornecedor = false;
            this.fornecedorSelecionado = JSON.parse(JSON.stringify(fornecedor));
            this.movimento.fornecedorDTO = JSON.parse(JSON.stringify(fornecedor));
            this.cdr.detectChanges();
        }
    }

    setMotorista(funcionario: FuncionarioDTO): void {
        if (!funcionario.status) {
            const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
            activeModal.componentInstance.modalHeader = 'Atenção';
            activeModal.componentInstance.modalContent = 'Motorista informado está inativo';
            activeModal.componentInstance.modalType = 'error';
            activeModal.componentInstance.defaultLabel = 'Ok';
            activeModal.result.then((result) => {
                this.resetaMotorista();
                this.cdr.detectChanges();
            }, (error) => {
                this.resetaMotorista();
                this.cdr.detectChanges();
            });
        } else if (!funcionario.indMotorista) {
            const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
            activeModal.componentInstance.modalHeader = 'Atenção';
            activeModal.componentInstance.modalContent = 'Funcionario informado não está configurado como motorista';
            activeModal.componentInstance.modalType = 'error';
            activeModal.componentInstance.defaultLabel = 'Ok';
            activeModal.result.then((result) => {
                this.resetaMotorista();
                this.cdr.detectChanges();
            }, (error) => {
                this.resetaMotorista();
                this.cdr.detectChanges();
            });
        } else {
            this.movimento.motoristaDTO = funcionario;
            this.cdr.detectChanges();
        }
    }

    setConferente(funcionario: FuncionarioDTO): void {
        if (!funcionario.status) {
            const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
            activeModal.componentInstance.modalHeader = 'Atenção';
            activeModal.componentInstance.modalContent = 'Conferente informado está inativo';
            activeModal.componentInstance.modalType = 'error';
            activeModal.componentInstance.defaultLabel = 'Ok';
            activeModal.result.then((result) => {
                this.resetaConferente();
                this.cdr.detectChanges();
            }, (error) => {
                this.resetaConferente();
                this.cdr.detectChanges();
            });
        } else if (!funcionario.indConferente) {
            const activeModal = this._modalService.open(AppMovimentoModalConfirmComponent);
            activeModal.componentInstance.modalHeader = 'Atenção';
            activeModal.componentInstance.modalContent = 'Funcionario informado não está configurado como conferente';
            activeModal.componentInstance.modalType = 'error';
            activeModal.componentInstance.defaultLabel = 'Ok';
            activeModal.result.then((result) => {
                this.resetaConferente();
                this.cdr.detectChanges();
            }, (error) => {
                this.resetaConferente();
                this.cdr.detectChanges();
            });
        } else {
            this.movimento.conferenteDTO = funcionario;
            this.cdr.detectChanges();
        }
    }

    resetaFornecedor(): void {
        this.fornecedorSelecionado = new FornecedorDTO();
        this.movimento.fornecedorDTO = null;
    }
    resetaMotorista(): void {
        this.movimento.motoristaDTO = null;
    }
    resetaConferente(): void {
        this.movimento.conferenteDTO = null;
    }
    resetaCliente(): void {
        this.clienteSelecionado = new ClienteDTO();
        this.movimento.clienteDTO = null;
    }

    getItemSaldoEstoque(estoqueAlmoxarifadoDTO: EstoqueAlmoxarifadoDTO, idItem: number): void {
        this.itemEstoqueStatus.flgBuscando = 1;
        this.itemEstoqueStatus.msg = 'Buscando o Saldo para Item no Almoxarifado: ' + estoqueAlmoxarifadoDTO.nome;
        this._itemService.getItemSaldoEstoque(estoqueAlmoxarifadoDTO.id, idItem)
            .subscribe((data) => {
                this.itemProcura.qtdEntrada = data.qtdEntrada;
                this.itemProcura.qtdSaida = data.qtdSaida;
                this.itemProcura.qtdSaldo = data.qtdSaldo;
                this.itemEstoqueStatus.flgBuscando = 0;
                this.itemEstoqueStatus.msg = 'Unidade(s) - Estoque atual para o Almoxarifado: ' + estoqueAlmoxarifadoDTO.nome;
                this.cdr.detectChanges();
            }, (err) => {
                this.itemProcura.qtdEntrada = 0;
                this.itemProcura.qtdSaida = 0;
                this.itemProcura.qtdSaldo = 0;
                this.itemEstoqueStatus.flgBuscando = 0;
                this.itemEstoqueStatus.msg = 'Não existe lançamento para o item neste Almoxarifado';
                this.cdr.detectChanges();
            });
    }

    onChangeAlmoxarifado(alx: any): void {
        this.onLimpaMovimentoItem();
        this.cdr.detectChanges();
    }

    getRowClass(row: any) {
        return {
            'datatable-row-class': 1 === 1,
        };
    }
    voltar(): void {
        if (this.statusForm === 2) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }
    editando(): void {
        const sel: MovimentoDTO[] = this.pageMovimento.content.filter(us => {
            return us.id === this.selected[0].id;
        });

        this.setaMovimento(sel[0]);
        this.statusForm = 2;
        this.cdr.detectChanges();
    }

    setaMovimento(movimento: MovimentoDTO): void {
        this.movimento = movimento;

        this.movimento.movimentoItemDTOs = this.movimento.movimentoItemDTOs.sort((obj1, obj2) => {
            if (obj1.ordemInclusaoTimestamp > obj2.ordemInclusaoTimestamp) {
                return 1;
            }
            if (obj1.ordemInclusaoTimestamp < obj2.ordemInclusaoTimestamp) {
                return -1;
            }
            return 0;
        });

        this.movimento.movimentoItemDTOs = [...this.movimento.movimentoItemDTOs];
        this.cdr.detectChanges();
    }

    onLimpa(): void {
        this.limpa();
        this.cdr.detectChanges();
    }
    limpa() {
        this.iniciaObjs();
        this.statusForm = 1;
        delete this.errorForm;
        this.selected = [];
    }

    openPrintPage(): void {
        const id = new Date().getTime();

        this._movimentoService.storageSet(id.toString(), { id: 'movimento', data: this.movimento })
            .subscribe((resp) => {
                console.log(resp);
                console.log('Deu tudo certo, vamos imprimir');
                const hrefFull = this._movimentoService.hrefContext() + 'print/movimento/' + id.toString();
                this.router.navigate([]).then(result => {
                    window.open(hrefFull, '_blank');
                });
                this.cdr.detectChanges();
            }, (error) => {
                console.log(error);
                this.pop('error', 'Erro ao tentar imprimir, contate o administrador', '');
                console.log('Erro ao tentar imprimir, contate o administrador, não salvou no indexdDB');
                this.cdr.detectChanges();
            });


        // localStorage.setItem(id.toString(), JSON.stringify({ id: 'movimento', data: this.movimento }));
        // const hrefFull = this._movimentoService.hrefContext() + 'print/movimento/' + id.toString();
        // console.log(hrefFull);
        // this.router.navigate([]).then(result => {
        // window.open(hrefFull, '_blank');
        // });
    }
    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.pageMovimento.content.length; i++) {
                if (this.movimento.id === this.pageMovimento.content[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.setaMovimento(this.pageMovimento.content[i - 1]);
                        this.selected.push(this.pageMovimento.content[i - 1]);
                        i = this.pageMovimento.content.length + 1;
                    }
                }
            }
        }
    }

    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.pageMovimento.content.length; i++) {
                if (this.movimento.id === this.pageMovimento.content[i].id) {
                    if ((i + 1) < this.pageMovimento.content.length) {
                        this.selected = [];
                        this.setaMovimento(this.pageMovimento.content[i + 1]);
                        this.selected.push(this.pageMovimento.content[i + 1]);
                        i = this.pageMovimento.content.length + 1;
                    }
                }
            }
        }
    }

    unsetSelected(): void {
        if (this.selected != null) {
            this.selected.splice(0, this.selected.length);
        }
        this.cdr.detectChanges();
    }

    onTable(): void {
        this.unsetSelected();
        if (this.pageMovimento != null && this.pageMovimento.content.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Erro', 'Procure primeiro.');
        }
    }
    iniciaObjs(): void {
        this.clienteSelecionado = new ClienteDTO();
        this.fornecedorSelecionado = new FornecedorDTO();

        this.movimento = new MovimentoDTO();
        this.movimento.movimentoTipoDTO = null;
        this.movimento.veiculoDTO = null;
        this.movimento.estoqueAlmoxarifadoDTO = null;
        this.movimento.usuarioInclusao = null;
        this.movimento.clienteDTO = null;
        this.movimento.fornecedorDTO = null;
        this.movimento.motoristaDTO = null;
        this.movimento.conferenteDTO = null;
        this.movimento.movimentoItemDTOs = [];
        this.movimento.movimentoOrigemDTO = null;
        this.movimento.indAtivo = true;

        this.movimentoItem = new MovimentoItemDTO();
        this.selectedItemMovimento = new MovimentoItemDTO();

        this.movimentoPesquisaDTO = new MovimentoPesquisaDTO();
        this.movimentoPesquisaDTO.dtaInicialPesquisa = this.convertDate(new Date());
        this.movimentoPesquisaDTO.dtaFinalPesquisa = this.convertDate(new Date());

        this.itemEstoqueStatus = new ItemEstoqueStatus();

        this.itemProcura = new ItemDTO();
    }
    addMovimentoItem(): void {
        // console.log('movimento item');

        if (
            (this.movimentoItem.itemDTO == null || this.movimentoItem.itemDTO.id == null) ||
            (this.movimentoItem.itemUnidadeDTO == null || this.movimentoItem.itemUnidadeDTO.id == null) ||
            (this.movimentoItem.qtd == null || this.movimentoItem.qtd <= 0)
        ) {
            this.mensagemAlerta('Erro - Atenção', `Para adicionar um item, o agrupamento, o item
            e a quantidade precisam ser adicionadas, favor revisar os campos.`, 'error');
        } else {
            const buscaMovItem = this.movimento.movimentoItemDTOs.filter(mv => {
                return mv.itemDTO.id === this.movimentoItem.itemDTO.id &&
                    mv.itemUnidadeDTO!.id === this.movimentoItem.itemUnidadeDTO!.id;
            });
            if (buscaMovItem.length > 0) {
                this.mensagemAlerta('Erro - Atenção', `O item com essa unidade já foi adicionado`, 'error');
            } else if (
                (this.movimentoItem.indGeraPreco != null && this.movimentoItem.indGeraPreco === true) &&
                (this.movimentoItem.valor == null || this.movimentoItem.valor === 0)
            ) {
                this.mensagemAlerta('Erro - Atenção', `Para gerar preço de Custo o valor
                 do item deve ser diferente de 0.`, 'error');
            } else if (
                (this.movimentoItem.indGeraValidade != null && this.movimentoItem.indGeraValidade === true) &&
                (this.movimentoItem.dtaValidade == null)
            ) {
                this.mensagemAlerta('Erro - Atenção', `Para gerar data de validade é
                 necessário adicionar a data de validade.`, 'error');
            } else {

                if (this.movimentoItem.valor == null || this.movimentoItem.valor <= 0) {
                    this.movimentoItem.valor = 0;
                }

                // console.log(this.movimentoItem);
                this.movimentoItem.status = 'novo';
                this.movimentoItem.ordemInclusaoTimestamp = new Date().getTime();

                this.movimento.movimentoItemDTOs.push(this.movimentoItem);

                this.movimento.movimentoItemDTOs = this.movimento.movimentoItemDTOs.sort((obj1, obj2) => {
                    if (obj1.ordemInclusaoTimestamp > obj2.ordemInclusaoTimestamp) {
                        return 1;
                    }
                    if (obj1.ordemInclusaoTimestamp < obj2.ordemInclusaoTimestamp) {
                        return -1;
                    }
                    return 0;
                });

                this.movimento.movimentoItemDTOs = [...this.movimento.movimentoItemDTOs];
                this.onLimpaMovimentoItem();
                this.inputIdCodItem.nativeElement.focus();
                this.cdr.detectChanges();
            }
        }
    }
    onLimpaMovimentoItem(): void {
        this.movimentoItem = new MovimentoItemDTO();
        this.selectedItemMovimento = new MovimentoItemDTO();
        this.itemProcura = new ItemDTO();
        this.selected = [];
        this.itemEstoqueStatus = new ItemEstoqueStatus();
    }
    onDeletaMovimentoItem(): void {
        for (let i = 0; i < this.movimento.movimentoItemDTOs.length; i++) {
            if (
                (this.movimento.movimentoItemDTOs[i].itemDTO.id === this.selectedItemMovimento.itemDTO.id) &&
                (this.movimento.movimentoItemDTOs[i].itemUnidadeDTO!.id === this.selectedItemMovimento.itemUnidadeDTO!.id)
            ) {
                this.movimento.movimentoItemDTOs.splice(i, 1);
                i = this.movimento.movimentoItemDTOs.length + 1;
            }
        }
        this.movimento.movimentoItemDTOs = [...this.movimento.movimentoItemDTOs];
        this.cdr.detectChanges();
    }



    buscaMovimentoTipos(): void {
        this._movimentoTipoService.getAllActive()
            .subscribe((resp) => {

                const dtaf = resp.filter(mt => {
                    return mt.roleAcesso == null || mt.roleAcesso.length === 0 ||
                        this.currentUserSalesApp.user.authorityDTOs.filter(auth => {
                            return auth.name === mt.roleAcesso;
                        }).length > 0;
                });

                this.movimentoTipos = dtaf.sort((d1, d2) => {
                    if (d1.nome > d2.nome) {
                        return 1;
                    }
                    if (d1.nome < d2.nome) {
                        return -1;
                    }
                    return 0;
                });
                this.cdr.detectChanges();
            }, (err) => {
                this.pop('error', 'Erro', 'Erro ao buscar tipos de movimento');
            });
    }

    compareUnidade(c1: ItemUnidadeDTO, c2: ItemUnidadeDTO): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }

    compareMovimentoOrigem(c1: MovimentoOrigemDTO, c2: MovimentoOrigemDTO): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }

    compareUsuarios(u1: UserDTO, u2: UserDTO): boolean {
        return u1 && u2 ? u1.login === u2.login : u1 === u2;
    }

    buscaVeiculos(): void {
        this._veiculoService.getAllActive()
            .subscribe((data) => {

                data = data.sort((obj1, obj2) => {
                    if (obj1.nome > obj2.nome) {
                        return 1;
                    }
                    if (obj1.nome < obj2.nome) {
                        return -1;
                    }
                    return 0;
                });


                this.veiculos = data;
                this.cdr.detectChanges();
            }, (err) => {
                this.pop('error', 'Erro', 'Erro ao buscar veiculos');
            });
    }

    buscaMovimentoOrigens(): void {
        this._movimentoService.getAllMovimentoOrigens()
            .subscribe((data: MovimentoOrigemDTO[]) => {

                data = data.sort((obj1, obj2) => {
                    if (obj1.nome > obj2.nome) {
                        return 1;
                    }
                    if (obj1.nome < obj2.nome) {
                        return -1;
                    }
                    return 0;
                });


                this.movimentoOrigens = data;
                this.cdr.detectChanges();
            }, (err) => {
                this.pop('error', 'Erro', 'Erro ao buscar origem de movimentos');
            });
    }

    buscaMotoristas(): void {
        this._funcionarioService.getAllActiveMotoristas()
            .subscribe((data) => {

                data = data.sort((obj1, obj2) => {
                    if (obj1.nome > obj2.nome) {
                        return 1;
                    }
                    if (obj1.nome < obj2.nome) {
                        return -1;
                    }
                    return 0;
                });


                this.motoristas = data;
                this.cdr.detectChanges();
            }, (err) => {
                this.pop('error', 'Erro', 'Erro ao buscar os almoxarifados');
            });
    }

    buscaConferentes(): void {
        this._funcionarioService.getAllActiveConferente()
            .subscribe((data) => {

                data = data.sort((obj1, obj2) => {
                    if (obj1.nome > obj2.nome) {
                        return 1;
                    }
                    if (obj1.nome < obj2.nome) {
                        return -1;
                    }
                    return 0;
                });


                this.conferentes = data;
                this.cdr.detectChanges();
            }, (err) => {
                this.pop('error', 'Erro', 'Erro ao buscar os almoxarifados');
            });
    }

    buscaAlmoxarifados(): void {
        this._estoqueAlmoxarifadoService.getAllActive()
            .subscribe((data) => {

                let dtaf = data.filter(alx => {
                    return alx.roleAcesso == null || alx.roleAcesso.length === 0 ||
                        this.currentUserSalesApp.user.authorityDTOs.filter(auth => {
                            return auth.name === alx.roleAcesso;
                        }).length > 0;
                });

                dtaf = dtaf.sort((obj1, obj2) => {
                    if (obj1.nome > obj2.nome) {
                        return 1;
                    }
                    if (obj1.nome < obj2.nome) {
                        return -1;
                    }
                    return 0;
                });

                this.almoxarifados = dtaf;
                this.cdr.detectChanges();
            }, (err) => {
                this.pop('error', 'Erro', 'Erro ao buscar os almoxarifados');
            });
    }

    buscaUsuarios(): void {
        this._usuarioService.getUsers()
            .subscribe((data) => {

                data = data.sort((obj1, obj2) => {
                    if (obj1.login > obj2.login) {
                        return 1;
                    }
                    if (obj1.login < obj2.login) {
                        return -1;
                    }
                    return 0;
                });


                this.usuarios = data;
                this.cdr.detectChanges();
            }, (err) => {
                this.pop('error', 'Erro', 'Erro ao buscar os usuários');
            });
    }
    atualizaMotoristas(): void {
        this.buscaMotoristas();
    }

    atualizaConferentes(): void {
        this.buscaConferentes();
    }

    atualizaUsuarios(): void {
        this.buscaUsuarios();
    }

    atualizaMovimentoTipo(): void {
        this.buscaMovimentoTipos();
    }

    atualizaVeiculo(): void {
        this.buscaVeiculos();
    }

    atualizaAlmoxarifados(): void {
        this.buscaAlmoxarifados();
    }

    compareMovimentoTipo(c1: MovimentoTipoDTO, c2: MovimentoTipoDTO): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }

    compareVeiculo(c1: VeiculoDTO, c2: VeiculoDTO): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }

    compareFuncionario(f1: FuncionarioDTO, f2: FuncionarioDTO): boolean {
        return f1 && f2 ? f1.id === f2.id : f1 === f2;
    }

    compareAlmoxarifado(c1: EstoqueAlmoxarifadoDTO, c2: EstoqueAlmoxarifadoDTO): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }


    onSelectMovimentoItem({ selected }: any) {
        this.selectedItemMovimento = selected[0];
    }
    onActivate(event: any) {
        if (
            (event.type === 'dblclick') ||
            (event.type === 'keydown' && event.event.keyCode === 13)
        ) {
            this.editando();
        }
    }

    convertDate(inputFormat: any): string {
        function pad(s: number) {
            return (s < 10) ? '0' + s : s;
        }
        const d = new Date(inputFormat);
        return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
    }
}
