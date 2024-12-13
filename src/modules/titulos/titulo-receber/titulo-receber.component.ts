import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppTituloModalAlertListComponent } from '../modals/app-titulo-modal-alert-list/app-titulo-modal-alert-list.component';
import { MessageAlertList } from '../../vendas/modals/app-venda-modal-alert-list/app-venda-modal-alert-list-utils';
import { AppTituloModalAlertComponent } from '../modals/app-titulo-modal-alert/app-titulo-modal-alert.component';
import { AppTituloModalConfirmComponent } from '../modals/app-titulo-modal-confirm/app-titulo-modal-confirm.component';
import moment from 'moment';
import 'moment/locale/pt-br';
import { ToastrService } from 'ngx-toastr'
import { ngxCsv } from 'ngx-csv';
import { Cmc7Validator, NossoNumeroUpdateAux, PageTituloReceber, TituloReceberDTO, TituloReceberPesquisaDTO, TituloStatus, TituloTipoBaixa, TituloTipoDTO } from '@modules/shared/models/titulo';
import { BancoFebrabanDTO } from '@modules/shared/models/generic';
import { ClienteService, TituloReceberService } from '@modules/shared/services';
import { ClienteDTO, ClienteEmissorDTO } from '@modules/shared/models/cliente';

@Component({
    selector: 'app-titulo-receber',
    templateUrl: './titulo-receber.component.html',
    styleUrls: ['./titulo-receber.component.scss'],
})
export class TituloReceberComponent implements OnInit {

    ColumnMode: any;
    submitted: boolean;
    statusForm: number;
    tituloReceberDTO!: TituloReceberDTO;
    pageTituloReceber!: PageTituloReceber;
    tituloReceberPesquisaDTO!: TituloReceberPesquisaDTO;
    botaoGeraCSV!: string;
    currentUserSalesApp!: any;
    selectionTypeSingle = SelectionType.single;
    tituloForm = new FormGroup({
        id: new FormControl<number | null>(null),
        emissorChequeDTO: new FormControl<ClienteDTO | null>(null),
        dtaInclusao: new FormControl<Date | null>(null),
        usuarioInclusao: new FormControl<string | null>(''),
        emissorChequeId: new FormControl<number | null>(null),
        numTitulo: new FormControl<string | null>(''),
        dtaEmissao: new FormControl<Date | null>(null, [Validators.required]),
        dtaVencimento: new FormControl<Date | null>(null, [Validators.required]),
        dtaLiquidacao: new FormControl<Date | null>(null),
        descricao: new FormControl<string | null>(null),
        vlrOriginal: new FormControl<number | null>(0, [Validators.required, Validators.min(1)]),
        vlrTotal: new FormControl<number | null>(0),
        vlrLiquidado: new FormControl<number | null>(0, [Validators.min(0)]),
        vlrJuros: new FormControl<number | null>(0, [Validators.min(0)]),
        vlrMulta: new FormControl<number | null>(0, [Validators.min(0)]),
        vlrDesconto: new FormControl<number | null>(0, [Validators.min(0)]),
        vlrTaxaCobranca: new FormControl<number | null>(0, [Validators.min(0)]),
        vlrDespesaAcessoria: new FormControl<number | null>(0, [Validators.min(0)]),
        numTituloCNAB: new FormControl<string | null>(''),
        indStatus: new FormControl<string | null>(null, [Validators.required]),
        tituloTipoDTO: new FormControl<TituloTipoDTO | null>(null, [Validators.required]),

        bancoFebrabanDTO: new FormControl<BancoFebrabanDTO | null>(null, [Validators.required]),
        codBanco: new FormControl<number | null>(null),

        tituloTipoBaixa: new FormControl<TituloTipoDTO | null>(null),
        indTipoBaixa: new FormControl<string | null>(null),

        vendaDTO_id: new FormControl<number | null>(null),

        clienteDTO: new FormControl<ClienteDTO | null>(null, [Validators.required]),
        clienteId: new FormControl<number | null>(null),

        clienteEmissorDTO: new FormControl<ClienteEmissorDTO | null>(null),
        clienteEmissorId: new FormControl<number | null>(null),
        cmc7: new FormControl<string | null>(null),
        numCheque: new FormControl<number | null>(null),
        agenciaCheque: new FormControl<string | null>(null),
        contaCheque: new FormControl<string | null>(null),
    });

    selected: any[] = [];

    bancoFebrabans!: BancoFebrabanDTO[] | undefined;
    tituloTipos!: TituloTipoDTO[] | undefined;
    tituloStatus!: TituloStatus[];
    tituloTipoBaixas!: TituloTipoBaixa[];

    flgPesquisandoCliente: number;
    flgPesquisandoEmissor: number;

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
        private _tituloReceberService: TituloReceberService,
    ) {
        this.submitted = false;
        this.statusForm = 1;
        this.ColumnMode = ColumnMode;
        this.flgPesquisandoCliente = 0;
        this.flgPesquisandoEmissor = 0;
    }

    get f() { return this.tituloForm.controls; }

    async ngOnInit(): Promise<void> {
        // this.createForm();
        await this.iniciaObjs();
        this.currentUserSalesApp = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);
        this.cdr.detectChanges();
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

    async iniciaObjs(): Promise<void> {
        this.initDefaults();

        this.tituloReceberDTO = new TituloReceberDTO();

        this.pageTituloReceber = new PageTituloReceber();
        this.pageTituloReceber.content = [];

        this.tituloReceberPesquisaDTO = new TituloReceberPesquisaDTO();
        this.tituloTipos = await this._tituloReceberService.getTituloTipos().toPromise();
        this.bancoFebrabans = await this._tituloReceberService.getBancoFebraban().toPromise();

        this.bancoFebrabans = this.bancoFebrabans!.sort((b1, b2) => {
            if (b1.desBanco > b2.desBanco) {
                return 1;
            }
            if (b1.desBanco < b2.desBanco) {
                return -1;
            }
            return 0;
        });

        this.tituloTipos = this.tituloTipos!.sort((b1, b2) => {
            if (b1.id > b2.id) {
                return 1;
            }
            if (b1.id < b2.id) {
                return -1;
            }
            return 0;
        });
        this.cdr.detectChanges();
    }

    isVinculoPreVenda(): boolean {
        if (this.tituloReceberDTO != null &&
            this.tituloReceberDTO.vendaDTO_id != null &&
            this.tituloReceberDTO.vendaDTO_id > 0) {
            return true;
        } else {
            return false;
        }
    }

    validarCMC7(campo: string): boolean {

        return false;
    }

    modulo10(numero: string): string {
        let dac = 0;
        const posicao1 = numero.length - 1;
        const multi = 2;
        let acumula = 0;

        while (posicao1 >= 0) {
            const resultado = Number(numero.substring(posicao1, posicao1 + 1)) * multi;
            let posicao2 = resultado.toString().length - 1;

            while (posicao2 >= 0) {
                acumula += Number(resultado.toString().substring(posicao2, posicao2 + 1));
                posicao2--;
            }
        }

        dac = acumula % 10;
        dac = 10 - dac;

        if (dac === 10) {
            dac = 0;
        }
        return dac.toString();
    }

    isValidDelete(): boolean {
        return this.isVinculoPreVenda() === true ? false : true;
    }

    tooltipBtnDeletar(): string {
        if (!this.isValidDelete()) {
            return 'Titulo está vinculado a um pedido e não pode ser deletado, excluindo a pré venda ele será removido automaticamente';
        }
        return '';
    }

    initDefaults(): void {
        this.statusForm = 1;
        this.botaoGeraCSV = 'Gerar CSV';
        this.submitted = false;
        this.flgPesquisandoCliente = 0;
        this.flgPesquisandoEmissor = 0;
        this.iniciaTituloStatus();
    }

    iniciaTituloStatus(): void {
        this.tituloStatus = [];

        const statusAberto = new TituloStatus();
        statusAberto.nome = 'ABERTO';
        statusAberto.sigla = 'A';

        const statusFechado = new TituloStatus();
        statusFechado.nome = 'FECHADO';
        statusFechado.sigla = 'F';

        const statusNegociado = new TituloStatus();
        statusNegociado.nome = 'NEGOCIADO';
        statusNegociado.sigla = 'N';

        const statusProtesto = new TituloStatus();
        statusProtesto.nome = 'EM PROTESTO';
        statusProtesto.sigla = 'P';

        this.tituloStatus.push(statusAberto);
        this.tituloStatus.push(statusFechado);
        this.tituloStatus.push(statusNegociado);
        this.tituloStatus.push(statusProtesto);

        this.tituloTipoBaixas = [];

        const tituloTipoBaixa1 = new TituloTipoBaixa();
        tituloTipoBaixa1.sigla = 'M';
        tituloTipoBaixa1.nome = 'MANUAL';

        const tituloTipoBaixa2 = new TituloTipoBaixa();
        tituloTipoBaixa2.sigla = 'S';
        tituloTipoBaixa2.nome = 'SISTEMICA';

        const tituloTipoBaixa3 = new TituloTipoBaixa();
        tituloTipoBaixa3.sigla = 'L';
        tituloTipoBaixa3.nome = 'LOTE';

        this.tituloTipoBaixas.push(tituloTipoBaixa1);
        this.tituloTipoBaixas.push(tituloTipoBaixa2);
        this.tituloTipoBaixas.push(tituloTipoBaixa3);
    }

    getStatusTitulo(sigla: string): string {
        const fil = this.tituloStatus.filter(st => {
            return st.sigla === sigla;
        });

        return fil.length > 0 ? fil[0].nome : 'STATUS REMOVIDO';
    }

    getTipoBaixaTitulo(sigla: string): string {
        const fil = this.tituloTipoBaixas.filter(st => {
            return st.sigla === sigla;
        });

        return fil.length > 0 ? fil[0].nome : 'TIPO BAIXA REMOVIDO';
    }


    voltar(): void {
        const id = this.tituloForm.controls.id.value;
        if (id != null && id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }

    geraCSV(): void {
        this.botaoGeraCSV = 'Gerando CSV';
        this._tituloReceberService.geraCSV(this.tituloReceberPesquisaDTO)
            .subscribe({
                next: dataRetorno => {
                    //console.log(dataRetorno);
                    this.botaoGeraCSV = 'Gerando! Baixando CSV';
                    this.cdr.detectChanges();

                    const dtaAtualUser = moment().format('YYYY_MM_DD_HH_mm_ss');
                    const nameReport = 'titulo_receber_' + this.currentUserSalesApp.username + '_' + dtaAtualUser;

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
                            'dtaUltAlteracao',
                            'usuarioUltAlteracao',
                            'usuarioBaixa',
                            'tipo',
                            'dtaEmissao',
                            'dtaVencimento',
                            'dtaLiquidacao',

                            'indStatus',
                            'indTipoBaixa',

                            'vlrOriginal',
                            'vlrTotal',
                            'vlrLiquidado',
                            'vlrJuros',
                            'vlrMulta',
                            'vlrDesconto',
                            'vlrTaxaCobranca',
                            'vlrDespesaAcessoria',

                            'banco',

                            'vendaId',
                            'chequeId',
                            'clienteId',
                            'clienteNome',
                            'vendedorId',
                            'vendedorNome',
                            'supervisorId',
                            'supervisorNome'
                        ],
                    };
                    const data: any[] = [];

                    dataRetorno.forEach((t: TituloReceberDTO) => {
                        const obj = {
                            id: t.id,
                            dtaInclusao: moment(t.dtaInclusao).format("DD/MM/YYYY HH:mm:ss"),
                            usuarioInclusao: t.usuarioInclusao,
                            dtaUltAlteracao: moment(t.dtaUltAlteracao).format("DD/MM/YYYY HH:mm:ss"),
                            usuarioUltAlteracao: t.usuarioUltAlteracao,
                            usuarioBaixa: t.usuarioBaixa,
                            tipo: t.tituloTipoDTO.nome,
                            dtaEmissao: moment(t.dtaEmissao).format("DD/MM/YYYY"),
                            dtaVencimento: moment(t.dtaVencimento).format("DD/MM/YYYY"),
                            dtaLiquidacao: (t.dtaLiquidacao != null ? moment(t.dtaLiquidacao).format("DD/MM/YYYY") : null),
                            indStatus: t.indStatus,
                            indTipoBaixa: t.indTipoBaixa,

                            vlrOriginal: (t.vlrOriginal.toString().replace('.', ',')),
                            vlrTotal: (t.vlrTotal.toString().replace('.', ',')),
                            vlrLiquidado: (t.vlrLiquidado.toString().replace('.', ',')),
                            vlrJuros: (t.vlrJuros.toString().replace('.', ',')),
                            vlrMulta: (t.vlrMulta.toString().replace('.', ',')),
                            vlrDesconto: (t.vlrDesconto.toString().replace('.', ',')),
                            vlrTaxaCobranca: (t.vlrTaxaCobranca.toString().replace('.', ',')),
                            vlrDespesaAcessoria: (t.vlrDespesaAcessoria.toString().replace('.', ',')),

                            banco: (t.bancoFebrabanDTO != null ? t.bancoFebrabanDTO.desBanco : null),

                            vendaId: t.vendaDTO_id,
                            chequeId: t.chequeRecebidoId,
                            clienteId: t.clienteDTO.id,
                            clienteNome: t.clienteDTO.nome,
                            vendedorId: (t.vendaTituloAuxDTO != null ? t.vendaTituloAuxDTO.vendedorDTO.id : null),
                            vendedorNome: (t.vendaTituloAuxDTO != null ? t.vendaTituloAuxDTO.vendedorDTO.nome : null),
                            supervisorId: (t.vendaTituloAuxDTO != null && t.vendaTituloAuxDTO.vendedorDTO.supervisorDTO != null ? t.vendaTituloAuxDTO.vendedorDTO.supervisorDTO.id : null),
                            supervisorNome: (t.vendaTituloAuxDTO != null && t.vendaTituloAuxDTO.vendedorDTO.supervisorDTO != null ? t.vendaTituloAuxDTO.vendedorDTO.supervisorDTO.nome : null),
                        };
                        console.log(obj);
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

    // geraCSV(): void {
    //     this.botaoGeraCSV = 'Gerando CSV';
    //     this._tituloReceberService.geraCSV(this.tituloReceberPesquisaDTO)
    //         .subscribe((data) => {
    //             // console.log(data);
    //             // console.log('realizando download do arquivo');
    //             const fileName = data.fileName;
    //             this.botaoGeraCSV = 'Gerando! Baixando CSV';
    //             this.cdr.detectChanges();
    //             this._tituloReceberService.donwloadCSV(data.id)
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
    //                     this.cdr.detectChanges();
    //                     this.botaoGeraCSV = 'Gerar CSV';
    //                     // console.log(err);
    //                 });
    //         }, (err) => {
    //             this.cdr.detectChanges();
    //             this.botaoGeraCSV = 'Gerar CSV';
    //             // console.log(err);
    //         });
    // }

    atualizaNossoNumero(row: TituloReceberDTO): void {
        console.log(row);
        if (row != null && row.numTituloCNAB != null && row.numTituloCNAB.length > 0) {
            const nnAux = new NossoNumeroUpdateAux();
            nnAux.tituloReceberDTO_id = row.id;
            nnAux.numTituloCNAB = row.numTituloCNAB;
            this._tituloReceberService.atualizaNossoNumero(nnAux)
                .subscribe((data) => {
                    // console.log(data);
                    // this.msgAlerta('OK', data.mensagem, 'error');
                    this.pop('success', data.mensagem, '');
                    this.cdr.detectChanges();
                }, (error) => {
                    // console.log(error);
                    this.msgAlerta('ATENÇÃO', 'Erro ao tentar atualizar o número CNAB', 'error');
                    // this.pop('error', 'ERRO', 'Erro ao tentar atualizar o número CNAB');
                    this.cdr.detectChanges();
                });
        } else {
            this.pop('error', 'ERRO', 'O número CNAB deve ser maior do que zero para atualizar');
        }
    }

    onCadastra(): void {
        this.submitted = true;

        if (this.tituloForm.invalid) {
            this.msgAlerta('Atenção', 'Existe campos que ainda precisam ser preenchidos', 'error');
        } else {

            const tituloForm: any = this.tituloForm.getRawValue();
            this.tituloReceberDTO = tituloForm;
            this.tituloReceberDTO.vlrTotal = this.getVlrTotal();

            // console.log(this.tituloReceberDTO);

            this.spinner.show('fullSpinner');
            this._tituloReceberService.postOrPut(this.tituloReceberDTO, this.statusForm)
                .subscribe({
                    next: (data) => {
                        this.spinner.hide('fullSpinner');
                        // console.log(data);
                        this.dtoToForm(data);
                        this.statusForm = 2;
                        this.pageTituloReceber.content = [];
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

    msgAlerta(titulo: string, conteudo: string, tipo: string): void {
        const activeModal = this._modalService.open(
            AppTituloModalAlertComponent, { backdrop: true });
        activeModal.componentInstance.modalHeader = titulo;
        activeModal.componentInstance.modalContent = conteudo;
        activeModal.componentInstance.modalType = tipo;
        activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
    }

    daysFromVencEmissao(): number {
        let days = 0;

        const dtaEmissao = this.tituloForm.controls.dtaEmissao.value;
        const dtaVencimento = this.tituloForm.controls.dtaVencimento.value;

        if (dtaEmissao != null && dtaVencimento != null) {
            const mDtaEmissao = moment(dtaEmissao, 'YYYY-MM-DD');
            const mDtaVencimento = moment(dtaVencimento, 'YYYY-MM-DD');
            // console.log(mDtaVencimento.diff(mDtaEmissao, 'days'));
            days = mDtaVencimento.diff(mDtaEmissao, 'days');
        }

        return days;
    }

    daysFromLiquiEmissao(): number {
        let days = 0;

        const dtaEmissao = this.tituloForm.controls.dtaEmissao.value;
        const dtaLiquidacao = this.tituloForm.controls.dtaLiquidacao.value;

        if (dtaEmissao != null && dtaLiquidacao != null) {
            const mDtaEmissao = moment(dtaEmissao, 'YYYY-MM-DD');
            const mDtaLiquidacao = moment(dtaLiquidacao, 'YYYY-MM-DD');
            // console.log(mDtaVencimento.diff(mDtaEmissao, 'days'));
            days = mDtaLiquidacao.diff(mDtaEmissao, 'days');
        }

        return days;
    }

    vlrLiquidadoValor(): number {
        let vlr = 0;
        const vlrLiquidado: number | null = this.tituloForm.controls.vlrLiquidado.value;

        if ((vlrLiquidado != null && vlrLiquidado > 0) && this.getVlrTotal() > 0) {
            vlr = (vlrLiquidado - this.getVlrTotal());
        }

        return vlr;
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
    onDeleta(): void {
        const id = this.tituloForm.controls.id.value;
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
                    this._tituloReceberService.del(id)
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
            this.msgAlerta('Atenção', `Selecione um titulo primeiro,
            não é possível deletar sem um id válido`, 'alert');
        }
    }
    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    onPesquisa(): void {
        const tituloForm: any = this.tituloForm.getRawValue();
        this.tituloReceberPesquisaDTO.tituloReceberDTO = tituloForm;
        this.pesquisaTitulo(this.tituloReceberPesquisaDTO);
    }

    pesquisaTitulo(tituloReceberPesquisaDTO: TituloReceberPesquisaDTO): void {
        this.spinner.show('fullSpinner');
        this._tituloReceberService.find(tituloReceberPesquisaDTO)
            .subscribe({
                next: (data) => {
                    this.spinner.hide('fullSpinner');
                    console.log(data);
                    const pageData = data;

                    this.pageTituloReceber = pageData;

                    this.pageTituloReceber.content.forEach(el => {
                        el.diasAtraso = this.getDiasAtraso(el);
                    });

                    if (this.pageTituloReceber.content.length === 0) {
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

    async onLimpa(): Promise<void> {
        this.onReset();
        await this.iniciaObjs();
        this.pop('success', 'Limpo com sucesso', '');
    }

    selectBancoByCod(): void {
        const cod = this.tituloForm.controls.codBanco.value;

        if (cod != null && cod > 0) {
            const bank = this.bancoFebrabans!.filter(b => {
                return b.codBanco === cod;
            });

            if (bank.length > 0) {
                this.tituloForm.patchValue({
                    bancoFebrabanDTO: bank[0]
                });
            } else {
                this.pop('warning', 'Atenção', 'Não existe banco com esse id, digite outro');
            }
        }
        this.cdr.detectChanges();
    }

    message(header: string, content: string): void {
        const activeModal = this._modalService.open(AppTituloModalAlertComponent);
        activeModal.componentInstance.modalHeader = header;
        activeModal.componentInstance.modalContent = content;
        activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
    }
    limapaDadosCMC7(): void {
        this.tituloForm.patchValue({
            codBanco: null,
            agenciaCheque: null,
            numCheque: null,
            contaCheque: null,
            bancoFebrabanDTO: null,
            cmc7: null,
        });
    }
    infoCMC7(event: any): void {
        const cmc7: string | null = this.tituloForm.controls.cmc7.value;

        if (event != null) {
            event.srcElement.blur();
            event.preventDefault();
        }

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

                        this.tituloForm.patchValue({
                            codBanco: Number(vCodBanco),
                        });
                        this.selectBancoByCod();
                    }

                    if (cmc7.length >= 7) {
                        this.tituloForm.patchValue({
                            agenciaCheque: (cmc7.substring(3, 7)),
                        });
                    }

                    if (cmc7.toString().length >= 17) {
                        // console.log(cmc7.substring( 11,17));
                        this.tituloForm.patchValue({
                            numCheque: Number(cmc7.substring(11, 17)),
                        });
                    }

                    if (cmc7.toString().length >= 28) {
                        // console.log(cmc7.substring(22, 28));
                        this.tituloForm.patchValue({
                            contaCheque: (cmc7.substring(23, 29)),
                        });
                    }


                } else {

                    if (vCodBanco.length >= 3) {

                        this.tituloForm.patchValue({
                            codBanco: Number(vCodBanco),
                        });
                        this.selectBancoByCod();
                    }

                    if (cmc7.length >= 7) {
                        this.tituloForm.patchValue({
                            agenciaCheque: (cmc7.substring(3, 7)),
                        });
                    }

                    if (cmc7.toString().length >= 17) {
                        // console.log(cmc7.substring( 11,17));
                        this.tituloForm.patchValue({
                            numCheque: Number(cmc7.substring(11, 17)),
                        });
                    }

                    if (cmc7.toString().length >= 28) {
                        // console.log(cmc7.substring(22, 28));
                        this.tituloForm.patchValue({
                            contaCheque: (cmc7.substring(21, 29)),
                        });
                    }
                }
            }
        }
    }

    findClienteById(): void {
        const idCliente = this.tituloForm.controls.clienteId.value;

        if (idCliente == null || isNaN(idCliente)) {
            this.pop('error', 'Erro', 'Digite um id valido para pesquisa');
        } else {

            this.selectClienteByCod(idCliente);
        }
    }

    findEmissorById(): void {
        const idEmissor = this.tituloForm.controls.emissorChequeId.value;

        if (idEmissor == null || isNaN(idEmissor)) {
            this.pop('error', 'Erro', 'Digite um id valido para pesquisa');
        } else {

            this.selectEmissorByCod(idEmissor);
        }
    }

    selectClienteByCod(id: number): void {
        this.flgPesquisandoCliente = 1;
        this._tituloReceberService.findById(id)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.setaModelAndFormCliente(data);
                    this.pop('success', 'Cliente encontrado com sucesso', '');
                    this.flgPesquisandoCliente = 0;
                    this.cdr.detectChanges();
                },
                error: (rr) => {
                    this.flgPesquisandoCliente = 0;
                    this.pop('error', 'Erro', 'Não foi encontrado cliente com esse codigo');
                    this.cdr.detectChanges();
                }
            });
    }

    selectEmissorByCod(id: number): void {
        this.flgPesquisandoEmissor = 1;
        this._tituloReceberService.findById(id)
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

    setaModelAndFormCliente(cliente: ClienteDTO): void {
        this.tituloForm.patchValue({
            clienteDTO: cliente,
            clienteId: cliente.id,
        });
    }

    setaModelAndFormEmissor(cliente: ClienteDTO): void {
        this.tituloForm.patchValue({
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

    bancoSelecionado(): void {
        const banco: BancoFebrabanDTO | null = this.tituloForm.controls.bancoFebrabanDTO.value;

        if (banco != null) {
            this.tituloForm.patchValue({
                codBanco: banco.codBanco
            });
        }
    }

    onReset() {
        this.submitted = false;
        this.tituloForm.reset();

        this.tituloForm.patchValue({
            vlrOriginal: 0,
            vlrJuros: 0,
            vlrMulta: 0,
            vlrTaxaCobranca: 0,
            vlrDespesaAcessoria: 0,
            vlrTotal: 0,
            vlrLiquidado: 0,
        });

        this.tituloForm.enable();
        this.tituloForm.controls.tituloTipoBaixa.disable();
    }

    dtoToForm(tituloReceberDTO: TituloReceberDTO): void {
        this.tituloReceberDTO = tituloReceberDTO;



        this.tituloForm.patchValue({
            id: tituloReceberDTO.id,

            numTitulo: tituloReceberDTO.numTitulo,
            dtaEmissao: tituloReceberDTO.dtaEmissao,
            dtaVencimento: tituloReceberDTO.dtaVencimento,

            descricao: tituloReceberDTO.descricao,

            dtaLiquidacao: tituloReceberDTO.dtaLiquidacao,
            vlrOriginal: tituloReceberDTO.vlrOriginal,
            vlrTotal: tituloReceberDTO.vlrTotal,
            vlrLiquidado: tituloReceberDTO.vlrLiquidado,
            vlrJuros: tituloReceberDTO.vlrJuros,
            vlrMulta: tituloReceberDTO.vlrMulta,
            vlrDesconto: tituloReceberDTO.vlrDesconto,
            vlrTaxaCobranca: tituloReceberDTO.vlrTaxaCobranca,
            vlrDespesaAcessoria: tituloReceberDTO.vlrDespesaAcessoria,
            numTituloCNAB: tituloReceberDTO.numTituloCNAB,
            indStatus: tituloReceberDTO.indStatus,
            tituloTipoDTO: tituloReceberDTO.tituloTipoDTO,

            bancoFebrabanDTO: tituloReceberDTO.bancoFebrabanDTO,
            codBanco: tituloReceberDTO.bancoFebrabanDTO.codBanco,

            indTipoBaixa: tituloReceberDTO.indTipoBaixa,

            vendaDTO_id: tituloReceberDTO.vendaDTO_id,

            clienteDTO: tituloReceberDTO.clienteDTO,
            clienteId: tituloReceberDTO.clienteDTO.id,

            clienteEmissorDTO: tituloReceberDTO.clienteEmissorDTO,
            clienteEmissorId: tituloReceberDTO.clienteEmissorDTO != null && tituloReceberDTO.clienteEmissorDTO.id != null &&
                tituloReceberDTO.clienteEmissorDTO.id > 0 ? tituloReceberDTO.clienteEmissorDTO.id : null,

            cmc7: tituloReceberDTO.cmc7,
            numCheque: tituloReceberDTO.numCheque,
            agenciaCheque: tituloReceberDTO.agenciaCheque,
            contaCheque: tituloReceberDTO.contaCheque,
        });
        this.tituloForm.controls.id.disable();
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.pageTituloReceber.content.length; i++) {
                const id = this.tituloForm.controls.id.value;
                if (id != null && !isNaN(id) && id === this.pageTituloReceber.content[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.dtoToForm(this.pageTituloReceber.content[i - 1]);
                        this.selected.push(this.pageTituloReceber.content[i - 1]);
                        i = this.pageTituloReceber.content.length + 1;
                    } else {
                        this.pop('error', 'Sem registro para mover, busque novamente ou pule a página', '');
                    }
                }
            }
        }
    }
    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.pageTituloReceber.content.length; i++) {
                const id = this.tituloForm.controls.id.value;
                if (id != null && !isNaN(id) && id === this.pageTituloReceber.content[i].id) {
                    if ((i + 1) < this.pageTituloReceber.content.length) {
                        this.selected = [];
                        this.dtoToForm(this.pageTituloReceber.content[i + 1]);
                        this.selected.push(this.pageTituloReceber.content[i + 1]);
                        i = this.pageTituloReceber.content.length + 1;
                    } else {
                        this.pop('error', 'Sem registro para mover, busque novamente ou pule a página', '');
                    }
                }
            }
        }
    }

    setPage(pageInfo: any) {
        // console.log(pageInfo);
        this.tituloReceberPesquisaDTO.pageSize = pageInfo.pageSize;
        this.tituloReceberPesquisaDTO.pageNumber = pageInfo.offset;
        this.pesquisaTitulo(this.tituloReceberPesquisaDTO);
    }

    onTable(): void {
        this.unsetSelected();
        if (this.pageTituloReceber != null && this.pageTituloReceber.content.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Erro', 'Procure primeiro.');
        }
    }

    getEmissoresCliente(): ClienteEmissorDTO[] {
        const cliente: ClienteDTO | null = this.tituloForm.controls.clienteDTO.value;
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

    compareTituloTipo(v1: TituloTipoDTO, v2: TituloTipoDTO): boolean {
        return v1 && v2 ? v1.id === v2.id : v1 === v2;
    }

    compareBancoFebrabans(v1: BancoFebrabanDTO, v2: BancoFebrabanDTO): boolean {
        return v1 && v2 ? v1.codBanco === v2.codBanco : v1 === v2;
    }

    compareTituloStatus(v1: string, v2: string): boolean {
        return v1 === v2;
    }

    compareTipoBaixa(v1: string, v2: string): boolean {
        return v1 && v2 ? v1 === v2 : v1 === v2;
    }

    compareEmissor(e1: ClienteEmissorDTO, e2: ClienteEmissorDTO): boolean {
        return e1 && e2 ? e1.id === e2.id : e1 === e2;
    }

    getVlrTotal(): number {
        const vlrOriginal: number | null = this.tituloForm.controls.vlrOriginal.value;
        const vlrJuros: number | null = this.tituloForm.controls.vlrJuros.value;
        const vlrMulta: number | null = this.tituloForm.controls.vlrMulta.value;
        const vlrTaxaCobranca: number | null = this.tituloForm.controls.vlrTaxaCobranca.value;
        const vlrDespesaAcessoria: number | null = this.tituloForm.controls.vlrDespesaAcessoria.value;

        return (vlrOriginal! + vlrJuros! + vlrMulta! + vlrTaxaCobranca! + vlrDespesaAcessoria!);
    }

    getRowClass(row: TituloReceberDTO) {
        return {
            'titulo-em-atraso': row.diasAtraso > 0,
        };
    }

    getDiasAtraso(row: TituloReceberDTO): number {
        let days = 0;
        const dtaVencimento = row.dtaVencimento;
        let dtaLiquidacaoOuAgora = row.dtaLiquidacao;
        if (dtaLiquidacaoOuAgora == null) {
            dtaLiquidacaoOuAgora = new Date();
        }
        const mDtaVencimento = moment(dtaVencimento, 'YYYY-MM-DD');
        const mLiquidacaoOuAgora = moment(dtaLiquidacaoOuAgora, 'YYYY-MM-DD');
        // console.log(mDtaVencimento);
        // console.log(mLiquidacaoOuAgora);
        days = mLiquidacaoOuAgora.diff(mDtaVencimento, 'days');
        if (days < 0) {
            days = 0;
        }
        return days;
    }

    editando(): void {
        const sel: TituloReceberDTO[] = this.pageTituloReceber.content.filter(us => {
            return us.id === this.selected[0].id;
        });

        this.dtoToForm(sel[0]);
        this.statusForm = 2;
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
// 237026570180000285740723825390
