import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, lastValueFrom, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { NgxSpinnerService } from 'ngx-spinner';
import { BancoFebrabanDTO } from '../../configuracoes/banco-febraban';
import { AppTituloModalAlertListComponent } from '../modals/app-titulo-modal-alert-list/app-titulo-modal-alert-list.component';
import { MessageAlertList } from '../../vendas/modals/app-venda-modal-alert-list/app-venda-modal-alert-list-utils';
import { AppTituloModalAlertComponent } from '../modals/app-titulo-modal-alert/app-titulo-modal-alert.component';
import { AppTituloModalConfirmComponent } from '../modals/app-titulo-modal-confirm/app-titulo-modal-confirm.component';
import { ToastrService } from 'ngx-toastr';
import { ngxCsv } from 'ngx-csv';
import moment from 'moment';
import { ChequeRecebidoDTO, ChequeRecebidoPesquisaDTO, Cmc7Validator, PageChequeRecebidos } from '@modules/shared/models/titulo';
import { ClienteDTO, ClienteEmissorDTO } from '@modules/shared/models/cliente';
import { ChequeRecebidoService, ClienteService } from '@modules/shared/services';
import { Router } from '@angular/router';


@Component({
    selector: 'app-cheque-recebidos',
    templateUrl: './cheques-recebidos.component.html',
    styleUrls: ['./cheques-recebidos.component.scss'],
})
export class ChequeRecebidosComponent implements OnInit {

    ColumnMode: any;
    submitted: boolean;
    statusForm: number;
    chequeRecebidoDTO!: ChequeRecebidoDTO;
    pageChequeRecebidos!: PageChequeRecebidos;
    chequeRecebidoPesquisaDTO!: ChequeRecebidoPesquisaDTO;
    botaoGeraCSV!: string;
    botaoGeraReport = 'Gerar Relatório';
    currentUserSalesApp!: any;
    selectionTypeSingle = SelectionType.single;
    flgPesquisandoCliente: number;
    flgPesquisandoEmissor: number;

    chequeForm = new FormGroup({
        id: new FormControl<number | null>(null),

        vendaDTOId: new FormControl<number | null>(null),
        romaneioId: new FormControl<number | null>(null),
        tituloReceberDTOId: new FormControl<number | null>(null),

        dtaInclusao: new FormControl<Date | null>(null),
        usuarioInclusao: new FormControl<string | null>(''),

        descricao: new FormControl<string | null>(''),

        compensado: new FormControl<boolean | null>(null),

        bancoFebrabanDTO: new FormControl<BancoFebrabanDTO | null>(null, [Validators.required]),
        codBanco: new FormControl<number | null>(null),

        clienteDTO: new FormControl<ClienteDTO | null>(null, [Validators.required]),
        clienteId: new FormControl<number | null>(null),

        emissorChequeId: new FormControl<number | null>(null),

        clienteEmissorDTO: new FormControl<ClienteEmissorDTO | null>(null),
        clienteEmissorId: new FormControl<number | null>(null),
        cmc7: new FormControl<string | null>(null),
        numCheque: new FormControl<number | null>(null),
        agenciaCheque: new FormControl<string | null>(null),
        contaCheque: new FormControl<string | null>(null),

        emissorChequeDTO: new FormControl<ClienteDTO | null>(null),

        dtaRecebimento: new FormControl<Date | string | null>(null, [Validators.required]),
        dtaProgBaixaCheque: new FormControl<Date | string | null>(null, [Validators.required]),

        vlr: new FormControl<number | null>(0, [Validators.required, Validators.min(1)]),
    });

    selected: any[] = [];

    bancoFebrabans!: BancoFebrabanDTO[] | undefined;

    // typeahead
    searchingCliente!: boolean;
    searchFailedCliente!: boolean;

    searchingEmissor!: boolean;
    searchFailedEmissor!: boolean;
    // typeahead


    /* formatter */
    formatterCliente = (x: { nome: string }) => x.nome;
    /* formatter */


    /* Serach Observable */
    searchCliente = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            tap(() => {
                this.searchingCliente = true;
            }),
            switchMap(term =>
                this._clienteService.nodejsFindByName(term)
                    .pipe(
                        tap(() => this.searchFailedCliente = false),
                        catchError(() => {
                            this.searchFailedCliente = true;
                            return of([]);
                        })),
            ), tap(() => {
                this.searchingCliente = false;
            }))

    searchEmissor = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            tap(() => {
                this.searchingEmissor = true;
            }),
            switchMap(term =>
                this._clienteService.nodejsFindByName(term)
                    .pipe(
                        tap(() => this.searchFailedEmissor = false),
                        catchError(() => {
                            this.searchFailedEmissor = true;
                            return of([]);
                        })),
            ), tap(() => {
                this.searchingEmissor = false;
            }))

    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _clienteService: ClienteService,
        private _modalService: NgbModal,
        private spinner: NgxSpinnerService,
        private _chequeRecebidoService: ChequeRecebidoService,
        private router: Router,
    ) {
        this.submitted = false;
        this.statusForm = 1;
        this.ColumnMode = ColumnMode;
        this.flgPesquisandoCliente = 0;
        this.flgPesquisandoEmissor = 0;
    }

    get f() { return this.chequeForm.controls; }

    ngOnInit(): void {
        // this.createForm();
        this.iniciaObjs();
        this.currentUserSalesApp = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);
    }

    async iniciaObjs(): Promise<void> {
        this.initDefaults();

        this.chequeRecebidoDTO = new ChequeRecebidoDTO();

        this.pageChequeRecebidos = new PageChequeRecebidos();
        this.pageChequeRecebidos.content = [];

        this.chequeRecebidoPesquisaDTO = new ChequeRecebidoPesquisaDTO();

        this.bancoFebrabans = await lastValueFrom(this._chequeRecebidoService.getBancoFebraban());

        this.bancoFebrabans = this.bancoFebrabans!.sort((b1, b2) => {
            if (b1.desBanco > b2.desBanco) {
                return 1;
            }
            if (b1.desBanco < b2.desBanco) {
                return -1;
            }
            return 0;
        });

        // this.chequeForm.controls.compensado.setValue(false);
        this.cdr.detectChanges();
    }

    initDefaults(): void {
        this.statusForm = 1;
        this.botaoGeraCSV = 'Gerar CSV';
        this.botaoGeraReport = 'Gerar Relatório';
        this.submitted = false;
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

    getRomaneioIdByVendaId(): void {
        const vendaId = this.chequeForm.controls.vendaDTOId.value;
        if (vendaId != null && vendaId > 0) {
            this._chequeRecebidoService.getRomaneioIdByVendaId(vendaId)
                .subscribe((data) => {
                    if (data.status === true && data.romaneioId != null && data.romaneioId > 0) {
                        const romaneioId = this.chequeForm.controls.romaneioId.value;
                        if (romaneioId == null || romaneioId <= 0) {
                            this.chequeForm.patchValue({
                                romaneioId: data.romaneioId
                            });
                        }
                    }
                    if (data.status === true && data.tituloId != null && data.tituloId > 0) {
                        const tituloId = this.chequeForm.controls.tituloReceberDTOId.value;
                        if (tituloId == null || tituloId <= 0) {
                            this.chequeForm.patchValue({
                                tituloReceberDTOId: data.tituloId
                            });
                        }
                    }

                    this.cdr.detectChanges();
                    this.pop('success', 'Romaneio encontrado com sucesso', '');
                });
        }
    }

    openPrintPage(cheques: ChequeRecebidoDTO[]): void {

        const id = new Date().getTime();
        const key = (this.currentUserSalesApp.username + '_' + id.toString());

        this._chequeRecebidoService.storageSet(key,
            {
                cheques: cheques
            })
            .subscribe(() => {
                const hrefFull = this._chequeRecebidoService.hrefContext() + 'print/cheque/' + key;
                this.botaoGeraReport = 'Gerar Relatório';
                this.router.navigate([]).then(() => {
                    window.open(hrefFull, '_blank');
                });
                this.cdr.markForCheck();
            }, (error) => {
                console.log(error);
                this.pop('error', 'Erro ao tentar imprimir, contate o administrador', '');
                console.log('Erro ao tentar imprimir, contate o administrador, não salvou no indexdDB');
                this.botaoGeraReport = 'Gerar Relatório';
                this.cdr.markForCheck();
            });
    }

    receberFinanceiro(): void {
        const id: number | null = this.chequeForm.controls['id'].value;

        if (id != null && id > 0) {
            this.spinner.show('fullSpinner');
            this._chequeRecebidoService.receberFinanceiro(id)
                .subscribe({
                    next: (data) => {
                        this.spinner.hide('fullSpinner');
                        this.dtoToForm(data);
                        this.statusForm = 2;
                        this.cdr.markForCheck();
                    },
                    error: (err) => {
                        this.spinner.hide('fullSpinner');
                        console.log(err);
                        this.toastr.error('Contate o administrador', 'Erro');
                    }
                });
        } else {
            this.toastr.warning('Selecione um cheque primeiro', 'Atenção');
        }
    }

    msgAlerta(titulo: string, conteudo: string, tipo: string): void {
        const activeModal = this._modalService.open(
            AppTituloModalAlertComponent, { backdrop: true });
        activeModal.componentInstance.modalHeader = titulo;
        activeModal.componentInstance.modalContent = conteudo;
        activeModal.componentInstance.modalType = tipo;
        activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
    }

    msgAlertaList(header: string, detail: string, messAList: MessageAlertList[], modalType: string): void {
        // console.log('alert list');
        // console.log(messAList);
        const activeModal = this._modalService.open(
            AppTituloModalAlertListComponent, { size: 'lg', scrollable: true, backdrop: true });
        activeModal.componentInstance.modalHeader = header;
        activeModal.componentInstance.modalDetail = detail;
        activeModal.componentInstance.modalMessageList = messAList;
        activeModal.componentInstance.modalType = modalType;
        activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
    }

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async onLimpa(): Promise<void> {
        this.onReset();
        await this.iniciaObjs();
        this.pop('success', 'Limpo com sucesso', '');
        this.cdr.detectChanges();
    }
    onCadastra(): void {
        this.submitted = true;

        if (this.chequeForm.invalid) {
            this.msgAlerta('Atenção', 'Existe campos que ainda precisam ser preenchidos', 'error');
        } else {

            const chequeRecebidoForm: any = this.chequeForm.getRawValue();
            this.chequeRecebidoDTO = chequeRecebidoForm;
            // console.log(this.chequeRecebidoDTO);

            this.spinner.show('fullSpinner');
            this._chequeRecebidoService.postOrPut(this.chequeRecebidoDTO, this.statusForm)
                .subscribe({
                    next: (data) => {
                        this.spinner.hide('fullSpinner');
                        // console.log(data);
                        this.dtoToForm(data);
                        this.statusForm = 2;
                        this.pageChequeRecebidos.content = [];
                        this.cdr.detectChanges();
                    },
                    error: (err) => {
                        this.spinner.hide('fullSpinner');
                        // console.log(err);
                        if (Object.prototype.hasOwnProperty.call(err, 'error') && err.error != null) {
                            const messAL: MessageAlertList[] = [];

                            if (Object.prototype.hasOwnProperty.call(err.error, 'fieldErrors') && err.error.fieldErrors != null
                                && err.error.fieldErrors.length > 0) {
                                for (let i = 0; i < err.error.fieldErrors.length; i++) {
                                    const mess = new MessageAlertList();
                                    mess.erro = err.error.fieldErrors[i].code;
                                    mess.message = err.error.fieldErrors[i].message;
                                    messAL.push(mess);
                                }
                            }

                            this.msgAlertaList(err.error.message, err.error.detail, messAL, 'error');
                        }
                        this.cdr.detectChanges();
                    }
                });
        }
    }

    onDeleta(): void {
        const id = this.chequeForm.controls.id.value;
        if (id != null && !isNaN(id) && id > 0 && this.statusForm === 2) {
            const activeModal = this._modalService.open(AppTituloModalConfirmComponent);
            activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
            activeModal.componentInstance.modalContent = 'Deseja realmente excluir ?';
            activeModal.componentInstance.modalType = 'confirm';
            activeModal.componentInstance.defaultLabel = 'Não';
            activeModal.result.then((result) => {
                if (result === 'confirm') {
                    this.spinner.show('fullSpinner');
                    let message = '';
                    this._chequeRecebidoService.del(id)
                        .subscribe({
                            next: async (resp: any) => {
                                this.spinner.hide('fullSpinner');
                                message = resp.message;
                                this.pop('success', 'OK', message);
                                await this.delay(1000);
                                this.onLimpa();
                                this.cdr.detectChanges();
                            },
                            error: (err) => {
                                this.spinner.hide('fullSpinner');
                                message = err.message;
                                this.pop('error', 'Erro', message);
                                this.cdr.detectChanges();
                            }
                        });
                }
            }, (error) => { console.log(error) });
        } else {
            this.msgAlerta('Atenção', `Selecione um cheque primeiro,
            não é possível deletar sem um id válido`, 'alert');
        }
    }

    bancoSelecionado(): void {
        const bancoForm: any = this.chequeForm.controls.bancoFebrabanDTO.value;
        const banco: BancoFebrabanDTO = bancoForm;

        if (banco != null) {
            this.chequeForm.patchValue({
                codBanco: banco.codBanco
            });
        }
    }

    dtoToForm(chequeRecebidoDTO: ChequeRecebidoDTO): void {
        this.chequeRecebidoDTO = chequeRecebidoDTO;
        // console.log(this.chequeRecebidoDTO);
        this.chequeForm.patchValue({
            id: this.chequeRecebidoDTO.id,
            romaneioId: this.chequeRecebidoDTO.romaneioId,
            vendaDTOId: this.chequeRecebidoDTO.vendaDTOId,
            tituloReceberDTOId: this.chequeRecebidoDTO.tituloReceberDTOId,

            dtaInclusao: this.chequeRecebidoDTO.dtaInclusao,
            usuarioInclusao: this.chequeRecebidoDTO.usuarioInclusao,

            descricao: this.chequeRecebidoDTO.descricao,

            bancoFebrabanDTO: this.chequeRecebidoDTO.bancoFebrabanDTO,
            codBanco: this.chequeRecebidoDTO.bancoFebrabanDTO != null ? this.chequeRecebidoDTO.bancoFebrabanDTO.codBanco : null,

            clienteDTO: this.chequeRecebidoDTO.clienteDTO,
            clienteId: this.chequeRecebidoDTO.clienteDTO != null ? this.chequeRecebidoDTO.clienteDTO.id : null,

            clienteEmissorDTO: this.chequeRecebidoDTO.clienteEmissorDTO,
            clienteEmissorId: this.chequeRecebidoDTO.clienteEmissorDTO != null ? this.chequeRecebidoDTO.clienteEmissorDTO.id : null,
            cmc7: this.chequeRecebidoDTO.cmc7,
            numCheque: this.chequeRecebidoDTO.numCheque,
            agenciaCheque: this.chequeRecebidoDTO.agenciaCheque,
            contaCheque: this.chequeRecebidoDTO.contaCheque,

            dtaRecebimento: this.chequeRecebidoDTO.dtaRecebimento,
            dtaProgBaixaCheque: this.chequeRecebidoDTO.dtaProgBaixaCheque,

            vlr: this.chequeRecebidoDTO.vlr,

            compensado: this.chequeRecebidoDTO.compensado,
        });
        this.chequeForm.controls.id.disable();
        this.cdr.detectChanges();

        this.getRomaneioIdByVendaId();
    }

    onReset() {
        this.submitted = false;
        this.chequeForm.reset();

        this.chequeForm.patchValue({
            vlr: 0,
            compensado: null,
        });

        this.chequeForm.enable();
    }

    onPesquisa(): void {
        const chequeForm: any = this.chequeForm.getRawValue();
        this.chequeRecebidoPesquisaDTO.chequeRecebidoDTO = chequeForm;
        this.pesquisaCheque(this.chequeRecebidoPesquisaDTO);
    }

    selectBancoByCod(): void {
        const cod = this.chequeForm.controls.codBanco.value;

        if (cod != null && cod > 0) {
            const bank = this.bancoFebrabans!.filter(b => {
                return b.codBanco === cod;
            });

            if (bank.length > 0) {
                this.chequeForm.patchValue({
                    bancoFebrabanDTO: bank[0]
                });
            } else {
                this.pop('warning', 'Atenção', 'Não existe banco com esse id, digite outro');
            }
        }
    }
    message(header: string, content: string): void {
        const activeModal = this._modalService.open(AppTituloModalAlertComponent);
        activeModal.componentInstance.modalHeader = header;
        activeModal.componentInstance.modalContent = content;
        activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
    }
    limapaDadosCMC7(): void {
        this.chequeForm.patchValue({
            codBanco: null,
            agenciaCheque: null,
            numCheque: null,
            contaCheque: null,
            bancoFebrabanDTO: null,
            cmc7: null,
        });
    }

    extractConcatenatedNumberString(inputString: string | null): string | null {
        const regex = /\d+/g; // Matches one or more digits
        const matches = inputString!.match(regex);

        if (matches) {
            // Concatenate the matched digits
            const concatenatedNumberString = matches.join('');
            return concatenatedNumberString;
        } else {
            return null;
        }
    }

    infoCMC7(event: any): void {


        if (event != null) {
            event.srcElement.blur();
            event.preventDefault();
        }

        const cmc7WitDirty: string | null = this.chequeForm.controls['cmc7'].value;
        const cmc7: string | null = this.extractConcatenatedNumberString(cmc7WitDirty);


        if (cmc7 == null || cmc7.length === 0) {
            this.message('Atenção', 'Digite um codigo valido para CMC7');
            this.limapaDadosCMC7();
        } else {
            const cmc7Validator = new Cmc7Validator();
            if (!cmc7Validator.validate(cmc7)) {
                this.message('Atenção', 'CMC7 invalido, verifique o codigo digitado');
                this.limapaDadosCMC7();
            } else {

                const vCodBanco = cmc7.substring(0, 3);

                if (vCodBanco === '341' || vCodBanco === '237') {

                    if (vCodBanco.length >= 3) {

                        this.chequeForm.patchValue({
                            codBanco: Number(vCodBanco),
                        });
                        this.selectBancoByCod();
                    }

                    if (cmc7.length >= 7) {
                        this.chequeForm.patchValue({
                            agenciaCheque: (cmc7.substring(3, 7)),
                        });
                    }

                    if (cmc7.toString().length >= 17) {
                        // console.log(cmc7.substring( 11,17));
                        this.chequeForm.patchValue({
                            numCheque: Number(cmc7.substring(11, 17)),
                        });
                    }

                    if (cmc7.toString().length >= 28) {
                        // console.log(cmc7.substring(22, 28));
                        this.chequeForm.patchValue({
                            contaCheque: (cmc7.substring(23, 29)),
                        });
                    }


                } else {

                    if (vCodBanco.length >= 3) {

                        this.chequeForm.patchValue({
                            codBanco: Number(vCodBanco),
                        });
                        this.selectBancoByCod();
                    }

                    if (cmc7.length >= 7) {
                        this.chequeForm.patchValue({
                            agenciaCheque: (cmc7.substring(3, 7)),
                        });
                    }

                    if (cmc7.toString().length >= 17) {
                        // console.log(cmc7.substring( 11,17));
                        this.chequeForm.patchValue({
                            numCheque: Number(cmc7.substring(11, 17)),
                        });
                    }

                    if (cmc7.toString().length >= 28) {
                        // console.log(cmc7.substring(22, 28));
                        this.chequeForm.patchValue({
                            contaCheque: (cmc7.substring(21, 29)),
                        });
                    }
                }
            }
        }
        this.chequeForm.controls['cmc7'].setValue(cmc7);
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.pageChequeRecebidos.content.length; i++) {
                const id = this.chequeForm.controls.id.value;
                if (id != null && !isNaN(id) && id === this.pageChequeRecebidos.content[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.dtoToForm(this.pageChequeRecebidos.content[i - 1]);
                        this.selected.push(this.pageChequeRecebidos.content[i - 1]);
                        i = this.pageChequeRecebidos.content.length + 1;
                    } else {
                        this.pop('error', 'Sem registro para mover, busque novamente ou pule a página', '');
                    }
                }
            }
        }
    }
    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.pageChequeRecebidos.content.length; i++) {
                const id = this.chequeForm.controls.id.value;
                if (id != null && !isNaN(id) && id === this.pageChequeRecebidos.content[i].id) {
                    if ((i + 1) < this.pageChequeRecebidos.content.length) {
                        this.selected = [];
                        this.dtoToForm(this.pageChequeRecebidos.content[i + 1]);
                        this.selected.push(this.pageChequeRecebidos.content[i + 1]);
                        i = this.pageChequeRecebidos.content.length + 1;
                    } else {
                        this.pop('error', 'Sem registro para mover, busque novamente ou pule a página', '');
                    }
                }
            }
        }
    }

    setPage(pageInfo: any) {
        // console.log(pageInfo);
        this.chequeRecebidoPesquisaDTO.pageSize = pageInfo.pageSize;
        this.chequeRecebidoPesquisaDTO.pageNumber = pageInfo.offset;
        this.pesquisaCheque(this.chequeRecebidoPesquisaDTO);
    }

    pesquisaCheque(chequeRecebidoPesquisaDTO: ChequeRecebidoPesquisaDTO): void {
        this.spinner.show('fullSpinner');
        this._chequeRecebidoService.find(chequeRecebidoPesquisaDTO)
            .subscribe({
                next: (data) => {
                    this.spinner.hide('fullSpinner');
                    const pageData = data;

                    this.pageChequeRecebidos = pageData;

                    if (this.pageChequeRecebidos.content.length === 0) {
                        this.pop('error', 'Pesquisa', 'Não foi encontrado nada com essa pesquisa.');
                    } else {
                        // console.log('mais que 1');
                        this.statusForm = 3;
                    }
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.spinner.hide('fullSpinner');
                    this.cdr.detectChanges();
                }
            });
    }

    onTable(): void {
        this.unsetSelected();
        if (this.pageChequeRecebidos != null && this.pageChequeRecebidos.content.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Erro', 'Procure primeiro.');
        }
    }

    selectClienteByCod(id: number): void {
        this.flgPesquisandoCliente = 1;
        this._chequeRecebidoService.findById(id)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.setaModelAndFormCliente(data);
                    this.pop('success', 'Cliente encontrado com sucesso', '');
                    this.flgPesquisandoCliente = 0;
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.flgPesquisandoCliente = 0;
                    this.pop('error', 'Erro', 'Não foi encontrado cliente com esse codigo');
                    this.cdr.detectChanges();
                }
            });
    }

    selectEmissorByCod(id: number): void {
        this.flgPesquisandoEmissor = 1;
        this._chequeRecebidoService.findById(id)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.setaModelAndFormEmissor(data);
                    this.pop('success', 'Emissor encontrado com sucesso', '');
                    this.flgPesquisandoEmissor = 0;
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.flgPesquisandoEmissor = 0;
                    this.pop('error', 'Erro', 'Não foi encontrado emissor com esse codigo');
                    this.cdr.detectChanges();
                }
            });
    }

    findClienteById(): void {
        const idCliente = this.chequeForm.controls.clienteId.value;

        if (idCliente == null || isNaN(idCliente)) {
            this.pop('error', 'Erro', 'Digite um id valido para pesquisa');
        } else {

            this.selectClienteByCod(idCliente);
            this.cdr.detectChanges();
        }
        this.cdr.detectChanges();
    }

    findEmissorById(): void {
        const idEmissor = this.chequeForm.controls.emissorChequeId.value;

        if (idEmissor == null || isNaN(idEmissor)) {
            this.pop('error', 'Erro', 'Digite um id valido para pesquisa');
        } else {

            this.selectEmissorByCod(idEmissor);
        }
        this.cdr.detectChanges();
    }

    setaModelAndFormCliente(cliente: ClienteDTO): void {
        this.chequeForm.patchValue({
            clienteDTO: cliente,
            clienteId: cliente.id,
        });
    }

    setaModelAndFormEmissor(cliente: ClienteDTO): void {
        this.chequeForm.patchValue({
            emissorChequeDTO: cliente,
            emissorChequeId: cliente.id,
        });
    }

    typeaHeadSelectCliente(event: any): void {
        this.selectClienteByCod(event.item.id);
    }

    typeaHeadSelectEmissor(event: any): void {
        this.selectEmissorByCod(event.item.id);
    }

    compareBancoFebrabans(v1: BancoFebrabanDTO, v2: BancoFebrabanDTO): boolean {
        return v1 && v2 ? v1.codBanco === v2.codBanco : v1 === v2;
    }

    compareEmissor(e1: ClienteEmissorDTO, e2: ClienteEmissorDTO): boolean {
        return e1 && e2 ? e1.id === e2.id : e1 === e2;
    }

    editando(): void {
        const sel: ChequeRecebidoDTO[] = this.pageChequeRecebidos.content.filter(us => {
            return us.id === this.selected[0].id;
        });

        this.dtoToForm(sel[0]);
        this.statusForm = 2;
    }

    getEmissoresCliente(): ClienteEmissorDTO[] {
        const cliente: ClienteDTO | null = this.chequeForm.controls.clienteDTO.value;
        if (cliente != null && cliente.clienteEmissorDTOs != null &&
            cliente.clienteEmissorDTOs.length > 0) {
            return cliente.clienteEmissorDTOs;
        } else {
            return [];
        }
    }

    unsetSelected(): void {
        if (this.selected != null) {
            this.selected.splice(0, this.selected.length);
        }
    }


    voltar(): void {
        const id = this.chequeForm.controls.id.value;
        if (id != null && id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }

    onActivate(event: any) {
        if (
            (event.type === 'dblclick') ||
            (event.type === 'keydown' && event.event.keyCode === 13)
        ) {
            this.editando();
        }
    }

    // geraCSVOLD(): void {
    //     this.botaoGeraCSV = 'Gerando CSV';
    //     this._chequeRecebidoService.geraCSV(this.chequeRecebidoPesquisaDTO)
    //         .subscribe((data) => {
    //             // console.log(data);
    //             // console.log('realizando download do arquivo');
    //             const fileName = data.fileName;
    //             this.botaoGeraCSV = 'Gerando! Baixando CSV';
    //             this.cdr.detectChanges();
    //             this._chequeRecebidoService.donwloadCSV(data.id)
    //                 .subscribe((respData) => {
    //                     // console.log('subscribe');
    //                     // console.log(data);
    //                     // console.log(respData);
    //                     this.botaoGeraCSV = 'Gerar CSV';
    //                     const dataBlob = [respData];
    //                     const file = new Blob(dataBlob, { type: 'text/plain;charset=utf-8' });
    //                     importedSaveAs(file, fileName);
    //                     // var fileUrl = window.URL.createObjectURL(file);

    //                     // console.log('abrindo janela');

    //                     // window.open(fileUrl);

    //                     // console.log(fileUrl);
    //                     this.cdr.detectChanges();
    //                 }, (err) => {
    //                     this.botaoGeraCSV = 'Gerar CSV';
    //                     this.cdr.detectChanges();
    //                     // console.log(err);
    //                 });
    //         }, (err) => {
    //             this.botaoGeraCSV = 'Gerar CSV';
    //             this.cdr.detectChanges();
    //             // console.log(err);
    //         });
    // }

    geraReport(): void {
        this.botaoGeraReport = 'Gerando Relatório';

        this._chequeRecebidoService.geraCSV(this.chequeRecebidoPesquisaDTO)
            .subscribe({
                next: (dataRetorno) => {
                    this.botaoGeraReport = 'Gerando! nova guia';
                    this.cdr.markForCheck();

                    this.openPrintPage(dataRetorno);

                },
                error: (err) => {
                    console.log(err);
                    this.toastr.error('Contate o administrador', 'Erro');
                }
            });
    }

    geraCSV(): void {
        this.botaoGeraCSV = 'Gerando CSV';
        this._chequeRecebidoService.geraCSV(this.chequeRecebidoPesquisaDTO)
            .subscribe({
                next: dataRetorno => {
                    this.botaoGeraCSV = 'Gerando! Baixando CSV';
                    this.cdr.detectChanges();

                    const dtaAtualUser = moment().format('YYYY_MM_DD_HH_mm_ss');
                    const nameReport = 'cheques_recebidos_' + this.currentUserSalesApp.username + '_' + dtaAtualUser;

                    const options = {
                        fieldSeparator: ';',
                        quoteStrings: '"',
                        decimalseparator: ',',
                        showLabels: true,
                        showTitle: false,
                        useBom: true,
                        noDownload: false,
                        headers: [
                            'id',
                            'dtaInclusao',
                            'usuarioInclusao',
                            'dtaRecebimento',
                            'dtaProgBaixaCheque',
                            'compensado',
                            'vlr',
                            'banco',
                            'agencia',
                            'conta',
                            'numcheque',
                            'cmc7',
                            'vendaId',
                            'tituloId',
                            'clienteId',
                            'clienteNome',
                            'emissorId',
                            'emissorNome'
                        ],
                    };
                    const data: any[] = [];

                    dataRetorno.forEach((t: ChequeRecebidoDTO) => {
                        const obj = {
                            id: t.id,
                            dtaInclusao: moment(t.dtaInclusao).format("DD/MM/YYYY HH:mm:ss"),
                            usuarioInclusao: t.usuarioInclusao,
                            dtaRecebimento: (t.dtaRecebimento != null ? moment(t.dtaRecebimento).format("DD/MM/YYYY") : null),
                            dtaProgBaixaCheque: (t.dtaProgBaixaCheque != null ? moment(t.dtaProgBaixaCheque).format("DD/MM/YYYY") : null),
                            compensado: (t.compensado != null && t.compensado === true ? 'SIM' : 'NÃO'),
                            vlr: (t.vlr.toString().replace('.', ',')),
                            banco: (t.bancoFebrabanDTO != null ? t.bancoFebrabanDTO.desBanco : null),
                            agencia: (t.agenciaCheque != null ? t.agenciaCheque : null),
                            conta: (t.contaCheque != null ? t.contaCheque : null),
                            numcheque: (t.numCheque != null ? t.numCheque : null),
                            cmc7: (t.cmc7 != null ? t.cmc7.toString() : null),
                            vendaId: (t.vendaDTOId != null ? t.vendaDTOId : null),
                            tituloReceberDTOId: (t.tituloReceberDTOId != null ? t.tituloReceberDTOId : null),
                            clienteId: (t.clienteDTO != null && t.clienteDTO.id != null ? t.clienteDTO.id : null),
                            clienteNome: (t.clienteDTO != null && t.clienteDTO.nome != null ? t.clienteDTO.nome : null),
                            emissorId: (t.clienteEmissorDTO != null && t.clienteEmissorDTO.id != null ? t.clienteEmissorDTO.id : null),
                            emissorNome: (t.clienteEmissorDTO != null && t.clienteEmissorDTO.id != null ? t.clienteEmissorDTO.nome : null)
                        };
                        data.push(obj);
                    });

                    const csv = new ngxCsv(data, nameReport, options);
                    this.botaoGeraCSV = 'Gerar CSV';
                    this.cdr.detectChanges();

                },
                error: err => {
                    this.botaoGeraCSV = 'Gerar CSV';
                    this.cdr.detectChanges();
                }
            });
    }
}
