import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { AppTituloModalAlertComponent } from '../modals/app-titulo-modal-alert/app-titulo-modal-alert.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import 'moment/locale/pt-br';
import moment from 'moment';
import { AppTituloModalAlertValidComponent } from '../modals/app-titulo-modal-alert-valid/app-titulo-modal-alert-valid.component';
import { ToastrService } from 'ngx-toastr';
import { BancoFebrabanDTO, CurrentUserSalesAppAux } from '@modules/shared/models/generic';
import { FormAux, TituloStatus, TituloTOTVSDTO, TituloTipoBaixa, TituloTipoDTO, ValidaTituloAux } from '@modules/shared/models/titulo';
import { ClienteService, TituloReceberService, TituloTotvsService } from '@modules/shared/services';
import { ClienteDTO, ClienteEmissorDTO } from '@modules/shared/models/cliente';

@Component({
    selector: 'app-tit-receber-totvs',
    templateUrl: './titulo-totvs.component.html',
    styleUrls: ['./titulo-totvs.component.scss'],
})
export class TituloTotvsComponent implements OnInit {

    ColumnMode: any;
    submitted: boolean;
    statusForm: number;

    pesqForm!: FormGroup;
    selected: any[] = [];
    selectionTypeSingle = SelectionType.single;
    bancoFebrabans!: BancoFebrabanDTO[]  | undefined;
    tituloTipos!: TituloTipoDTO[] | undefined;
    tituloStatus!: TituloStatus[];
    tituloTipoBaixas!: TituloTipoBaixa[];
    tituloTotvsDTOs!: TituloTOTVSDTO[];
    currentUserSalesApp!: CurrentUserSalesAppAux;

    flgPesquisandoCliente: number;
    flgPesquisandoEmissor!: number;

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

    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private spinner: NgxSpinnerService,
        private _clienteService: ClienteService,
        private _modalService: NgbModal,
        private _tituloReceberService: TituloReceberService,
        private _tituloTotvsService: TituloTotvsService,
    ) {
        this.submitted = false;
        this.statusForm = 1;
        this.ColumnMode = ColumnMode;
        this.flgPesquisandoCliente = 0;
    }

    ngOnInit() {
        this.iniciaObjs();
        this.createForm();
        this.currentUserSalesApp = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);
        this.cdr.detectChanges();
    }

    get f() { return this.pesqForm.controls; }

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
    createForm(): void {
        this.pesqForm = new FormGroup({
            dtaEmissao: new FormControl<Date|string|null>(null),
            dtaVencimento: new FormControl<Date|string|null>(null),

            indStatus: new FormControl<string|null>(null),
            tituloTipoDTO: new FormControl<TituloTipoDTO|null>(null),

            clienteDTO: new FormControl<ClienteDTO|null>(null),
            clienteId: new FormControl<number|null>(null),
        });
    }
    onReset() {
        this.submitted = false;
        this.pesqForm.reset();
        this.pesqForm.enable();
    }
    async iniciaObjs(): Promise<void> {
        this.initDefaults();

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

    initDefaults(): void {
        this.statusForm = 1;
        this.submitted = false;
        this.flgPesquisandoCliente = 0;
        this.tituloTotvsDTOs = [];
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
    }

    async onLimpa(): Promise<void> {
        this.onReset();
        await this.iniciaObjs();
        this.pop('success', 'Limpo com sucesso', '');
        this.cdr.detectChanges();
    }

    findClienteById(): void {
        const idCliente = this.pesqForm.controls['clienteId'].value;

        if (idCliente == null || isNaN(idCliente)) {
            this.pop('error', 'Erro', 'Digite um id valido para pesquisa');
        } else {

            this.selectClienteByCod(idCliente);
        }
    }

    selectClienteByCod(id: number): void {
        this.flgPesquisandoCliente = 1;
        this._tituloReceberService.findById(id)
            .subscribe((data) => {
                // console.log(data);
                this.setaModelAndFormCliente(data);
                this.pop('success', 'Cliente encontrado com sucesso', '');
                this.flgPesquisandoCliente = 0;
                this.cdr.detectChanges();
            }, (err) => {
                this.flgPesquisandoCliente = 0;
                this.pop('error', 'Erro', 'Não foi encontrado cliente com esse codigo');
                this.cdr.detectChanges();
            });
    }

    setaModelAndFormCliente(cliente: ClienteDTO): void {
        this.pesqForm.patchValue({
            clienteDTO: cliente,
            clienteId: cliente.id,
        });
    }

    typeaHeadSelectCliente(event: any): void {
        this.selectClienteByCod(event.item.id);
    }

    bancoSelecionado(): void {
        const banco: BancoFebrabanDTO = this.pesqForm.controls['bancoFebrabanDTO'].value;

        if (banco != null) {
            this.pesqForm.patchValue({
                codBanco: banco.codBanco
            });
        }
    }
    selectBancoByCod(): void {
        const cod = this.pesqForm.controls['codBanco'].value;

        if (cod != null && cod > 0) {
            const bank = this.bancoFebrabans!.filter(b => {
                return b.codBanco === cod;
            });

            if (bank.length > 0) {
                this.pesqForm.patchValue({
                    bancoFebrabanDTO: bank[0]
                });
            } else {
                this.pop('warning', 'Atenção', 'Não existe banco com esse id, digite outro');
            }
        }
    }
    
    onPesquisa(): void {
        this.submitted = true;
        const formValues: FormAux = this.pesqForm.getRawValue();
        //console.log(formValues);

        if (this.pesqForm.invalid) {
            this.msgAlerta('Atenção', 'Existe campos que ainda precisam ser preenchidos', 'error');
        } else {
            if (
                formValues.clienteId == null &&
                formValues.dtaEmissao == null &&
                formValues.dtaVencimento == null
            ) {
                this.msgAlerta('Atenção', 'Selecione pelo menos um dos campos (Data Emissão ou Data Vencimento ou Cliente)', 'error');
            } else {
                this.cdr.detectChanges();
                this.spinner.show('fullSpinner');
                this._tituloTotvsService.buscaTitulosLote(formValues)
                    .subscribe((data) => {
                        // console.log(data);
                        this.spinner.hide('fullSpinner');
                        this.tituloTotvsDTOs = data;

                        if (this.tituloTotvsDTOs.length > 0) {
                            this.pop('success', 'Encontrado com sucesso', '');
                        } else {
                            this.pop('error', 'Não foi encontrado nenhum titulo com essa pesquisa', '');
                        }
                        this.cdr.detectChanges();
                    }, (error) => {
                        this.spinner.hide('fullSpinner');
                        this.pop('error', 'Erro ao realizar busca', '');
                        this.cdr.detectChanges();
                    });
            }
        }
    }
    getStatusTitulo(sigla: string): string {
        const fil = this.tituloStatus.filter(st => {
            return st.sigla === sigla;
        });

        return fil.length > 0 ? fil[0].nome : 'STATUS REMOVIDO';
    }

    onSelecionaTodos(): void {
        this.tituloTotvsDTOs.forEach(trc => {
            if (trc.indStatus !== 'F' && trc.indStatus !== 'N' &&
                trc.vpago > 0
            ) {
                trc.indBaixar = true;
            }
        });
        this.pop('success', 'Selecionados', '');
    }

    onSetaDataEValor(): void {
        this.tituloTotvsDTOs.forEach(trc => {
            if (trc.indStatus !== 'F' && trc.indStatus !== 'N' &&
                trc.vpago > 0
            ) {
                // console.log('setado');
                trc.vlrBaixar = trc.vpago;
                trc.dtaBaixar = trc.dtPag;
            }
        });
        this.pop('success', 'Setado', '');
    }

    onBaixarSelecionados(): void {

        const titulos = this.tituloTotvsDTOs.filter(trc => {
            return trc.indBaixar === true;
        });

        if (titulos.length > 0) {

            const titulosValidados: any[] = [];
            this.tituloTotvsDTOs.forEach(trc => {
                titulosValidados.push(this.validaTitulo(trc));
            });

            const flt = titulosValidados.filter(tv => {
                return tv.valido === false;
            });

            if (flt.length > 0) {
                this.msgAlertaTitulos('Atenção', flt, 'error');
            } else {
                this.cdr.detectChanges();
                this.spinner.show('fullSpinner');
                this._tituloTotvsService.processaTitulosLote(this.tituloTotvsDTOs)
                    .subscribe(async (data) => {
                        // console.log(data);
                        this.spinner.hide('fullSpinner');
                        this.pop('success', data.message, '');

                        await this.delay(500);

                        this.onLimpa();
                        this.cdr.detectChanges();
                    }, (error) => {
                        this.spinner.hide('fullSpinner');
                        // console.log(error);
                        this.pop('error', 'Error ao processar titulos', '');
                        this.cdr.detectChanges();
                    });
            }


        } else {
            this.pop('error', 'Nenhum titulo selecionado para baixar', '');
            this.cdr.detectChanges();
        }

    }

    validaTitulo(t: any): ValidaTituloAux {
        if (t.indBaixar === true) {
            if (t.vlrBaixar == null || t.vlrBaixar === 0) {
                return new ValidaTituloAux(false, 'Titulo id: ' + t.tituloId + ' selecionado porem não foi lançado valor para baixar');
            } else if (t.dtaBaixar == null || moment(t.dtaBaixar).isValid() === false) {
                return new ValidaTituloAux(false, 'Titulo id: ' + t.tituloId + ' selecionado porem não foi lançado data para baixar');
            } else {
                return new ValidaTituloAux(true, 'Valido');
            }
        } else {
            return new ValidaTituloAux(true, 'Não selecionado');
        }
    }

    msgAlertaTitulos(titulo: string, validaTitulos: ValidaTituloAux[], tipo: string): void {
        const activeModal = this._modalService.open(
            AppTituloModalAlertValidComponent, { backdrop: true });
        activeModal.componentInstance.modalHeader = titulo;
        activeModal.componentInstance.validaTitulos = validaTitulos;
        activeModal.componentInstance.modalType = tipo;
        activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
    }

    getTipoBaixaTitulo(sigla: string): string {
        const fil = this.tituloTipoBaixas.filter(st => {
            return st.sigla === sigla;
        });

        return fil.length > 0 ? fil[0].nome : 'TIPO BAIXA REMOVIDO';
    }

    getRowClass(row: any) {
        return {
            'classe-fechado': row.indStatus === 'F' || row.indStatus === 'N',
            'classe-alerta': row.indBaixar === true,
        };
    }




    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
    msgAlerta(titulo: string, conteudo: string, tipo: string): void {
        const activeModal = this._modalService.open(
            AppTituloModalAlertComponent, { backdrop: true });
        activeModal.componentInstance.modalHeader = titulo;
        activeModal.componentInstance.modalContent = conteudo;
        activeModal.componentInstance.modalType = tipo;
        activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
    }
    onDownloadCSV(): void {
        const dtaAtualUser = moment().format('YYYY_MM_DD_HH_mm_ss');
        const nameReport = 'tit_sales_inova_' + this.currentUserSalesApp.username + '_' + dtaAtualUser;
        /*
        const options = {
            fieldSeparator: ';',
            quoteStrings: '"',
            decimalseparator: ',',
            showLabels: true,
            showTitle: false,
            useBom: true,
            noDownload: false,
            headers: [
                'TITULO_RECEBER_ID',
                'TITULO_TIPO',
                'DATA_EMISSAO',
                'DTA_VENCIMENTO',
                'DTA_LIQUIDACAO',
                'STATUS',
                'VALOR_ORIGINAL_SALES',
                'VALOR_LIQUIDADO_SALES',
                'BAIXAR',
                'VALOR_DA_BAIXA',
                'DTA_DA_BAIXA',
                'CLIENTE_NOME',
                'CLIENTE_CGC',
                'VENDA_ID',
                'INOVA_NR_SEQ',
                'INOVA_NR_NOTA',
                'INOVA_NOSSO_NUMERO',
                'INOVA_DTA_INCLUSAO',
                'INOVA_VALOR',
                'INOVA_VALOR_RECEBIDO',
                'INOVA_DTA_PAGAMENTO',
                'INOVA_USUARIO_INCLUSAO',
                'INOVA_USUARIO_QUITACAO',
            ],
        };
        const data = [];

        this.tituloTotvsDTOs.forEach((ic: TituloTOTVSDTO) => {
            const obj = {
                tituloId: ic.tituloId,
                tituloTipoNome: ic.tituloTipoNome,
                dtaEmissao: ic.dtaEmissao,
                dtaVencimento: ic.dtaVencimento,
                dtaLiquidacao: ic.dtaLiquidacao,
                indStatus: ic.indStatus,
                valorOriginal: ic.vlrOriginal,
                valorLiquidado: ic.vlrLiquidado,
                baixar: ic.indBaixar,
                valorBaixa: ic.vlrBaixar,
                dtaBaixa: ic.dtaBaixar,
                cliente: ic.clienteNome,
                cgc: ic.cgc,
                vendaId: ic.vendaId,
                inovaNrSeq: ic.recNrSequencialGravacao,
                inovaNota: ic.recNrNota,
                inovaNossoNumero: ic.recNossoNr,
                inovaDtaInclusao: ic.recDtInclusaoDocumento,
                inovaValor: ic.recVl,
                inovaValorRecebido: ic.recVlTotalRec,
                inovaDtaPagamento: ic.recDtPagamento,
                inovaUsuarioInclusao: ic.recUsuarioInclusao,
                inovaUsuarioQuitacao: ic.recUsuarioQuitacao,
            };
            data.push(obj);
        });



        const csv = new ngxCsv(data, nameReport, options);
        */
    }
}
