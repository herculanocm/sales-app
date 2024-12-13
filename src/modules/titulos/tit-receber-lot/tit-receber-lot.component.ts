import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { AppTituloModalAlertComponent } from '../modals/app-titulo-modal-alert/app-titulo-modal-alert.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import 'moment/locale/pt-br';
import { AppTituloModalAlertValidComponent } from '../modals/app-titulo-modal-alert-valid/app-titulo-modal-alert-valid.component';
import { ToastrService } from 'ngx-toastr';
import { BancoFebrabanDTO } from '@modules/shared/models/generic';
import { ChequeRecebidosByTitulos, TituloReceberChequeDTO, TituloStatus, TituloTipoBaixa, TituloTipoDTO, ValidaTituloAux } from '@modules/shared/models/titulo';
import { ClienteService, TituloReceberService } from '@modules/shared/services';
import { ClienteDTO, ClienteEmissorDTO } from '@modules/shared/models/cliente';

@Component({
    selector: 'app-tit-receber-lot',
    templateUrl: './tit-receber-lot.component.html',
    styleUrls: ['./tit-receber-lot.component.scss'],
})
export class TitReceberLotComponent implements OnInit {

    ColumnMode: any;
    submitted: boolean;
    statusForm: number;

    selected: any[] = [];
    selectionTypeSingle = SelectionType.single;
    bancoFebrabans!: BancoFebrabanDTO[] | undefined;
    tituloTipos!: TituloTipoDTO[] | undefined;
    tituloStatus!: TituloStatus[];
    tituloTipoBaixas!: TituloTipoBaixa[];

    tituloReceberCheques: TituloReceberChequeDTO[];

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

    pesqForm = new FormGroup({
        dtaEmissao: new FormControl<Date | string | null>(null),
        dtaVencimento: new FormControl<Date | string | null>(null, [Validators.required]),

        indStatus: new FormControl<string | null>(null),
        tituloTipoDTO: new FormControl<TituloTipoDTO | null>(null),

        bancoFebrabanDTO: new FormControl<BancoFebrabanDTO | null>(null),
        codBanco: new FormControl<number | null>(null),

        clienteDTO: new FormControl<ClienteDTO | null>(null),
        clienteId: new FormControl<number | null>(null),
    });

    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private spinner: NgxSpinnerService,
        private _clienteService: ClienteService,
        private _modalService: NgbModal,
        private _tituloReceberService: TituloReceberService,
    ) {
        this.submitted = false;
        this.statusForm = 1;
        this.tituloReceberCheques = [];
        this.ColumnMode = ColumnMode;
        this.flgPesquisandoCliente = 0;
    }

    ngOnInit() {
        this.iniciaObjs();
    }

    get f() { return this.pesqForm.controls; }

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
        this.tituloReceberCheques = [];
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


    async onLimpa(): Promise<void> {
        this.onReset();
        await this.iniciaObjs();
        this.pop('success', 'Limpo com sucesso', '');
        this.cdr.detectChanges();
    }
    findClienteById(): void {
        const idCliente = this.pesqForm.controls.clienteId.value;

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
        const banco: any = this.pesqForm.controls.bancoFebrabanDTO.value;

        if (banco != null) {
            this.pesqForm.patchValue({
                codBanco: banco.codBanco
            });
        }
    }
    selectBancoByCod(): void {
        const cod = this.pesqForm.controls.codBanco.value;

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

        if (this.pesqForm.invalid) {
            this.msgAlerta('Atenção', 'Existe campos que ainda precisam ser preenchidos', 'error');
        } else {
            this.spinner.show('fullSpinner');
            this._tituloReceberService.buscaTitulosLote(this.pesqForm.getRawValue())
                .subscribe((data) => {
                    this.spinner.hide('fullSpinner');
                    this.tituloReceberCheques = data;

                    if (this.tituloReceberCheques.length > 0) {
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

    getDiasAtraso(row: TituloReceberChequeDTO): number {
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

    getRowClass(row: TituloReceberChequeDTO) {
        return {
            'classe-fechado': row.indStatus === 'F' || row.indStatus === 'N',
            'classe-alerta': row.indBaixar === true,
        };
    }

    onBuscaChequesCompensados(): void {
        const ids = this.tituloReceberCheques.map(tr => tr.id).join();

        this.spinner.show('fullSpinner');
        this._tituloReceberService.buscaLoteByTituloReceberIds(ids)
            .subscribe((data) => {
                this.spinner.hide('fullSpinner');
                const cht: ChequeRecebidosByTitulos[] = data;

                if (cht.length > 0) {

                    this.pop('success', 'Cheques encontrados com sucesso', '');

                    this.tituloReceberCheques.forEach(trc => {
                        const fltCheques = cht.filter(c => {
                            return c.titulo_receber_id === trc.id;
                        });

                        if (fltCheques.length > 0) {
                            trc.vlrBaixar = fltCheques[0].vlr;
                            trc.dtaBaixar = moment((fltCheques[0].dta_prog_baixa_cheque), 'YYYY-MM-DD').format('YYYY-MM-DD');
                            trc.chequeRecebidoId = fltCheques[0].cheque_recebido_id;

                            // console.log(trc.dtaBaixar);
                        }

                    });

                    this.tituloReceberCheques = [...this.tituloReceberCheques];
                    this.cdr.detectChanges();
                } else {
                    this.pop('warning', 'Não foi encontrado nada na busca dos cheques', '');
                }

            }, (error) => {
                this.spinner.hide('fullSpinner');
                this.pop('error', 'Erro ao realizar busca dos cheques', '');
            });
    }

    onBaixarSelecionados(): void {

        const titulos = this.tituloReceberCheques.filter(trc => {
            return trc.indBaixar === true;
        });


        if (titulos.length > 0) {

            const titulosValidados: ValidaTituloAux[] = [];
            this.tituloReceberCheques.forEach(trc => {
                titulosValidados.push(this.validaTitulo(trc));
            });

            const flt = titulosValidados.filter(tv => {
                return tv.valido === false;
            });

            if (flt.length > 0) {
                this.msgAlertaTitulos('Atenção', flt, 'error');
            } else {
                this.spinner.show('fullSpinner');
                this._tituloReceberService.processaTitulosLote(this.tituloReceberCheques)
                    .subscribe(async (data) => {
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
        }
    }

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    validaTitulo(t: TituloReceberChequeDTO): ValidaTituloAux {
        if (t.indBaixar === true) {
            if (t.vlrBaixar == null || t.vlrBaixar === 0) {
                return new ValidaTituloAux(false, 'Titulo id: ' + t.id + ' selecionado porem não foi lançado valor para baixar');
            } else if (t.dtaBaixar == null || moment(t.dtaBaixar).isValid() === false) {
                return new ValidaTituloAux(false, 'Titulo id: ' + t.id + ' selecionado porem não foi lançado data para baixar');
            } else {
                return new ValidaTituloAux(true, 'Valido');
            }
        } else {
            return new ValidaTituloAux(true, 'Não selecionado');
        }
    }

    onSelecionaTodos(): void {
        this.tituloReceberCheques.forEach(trc => {
            if (trc.indStatus !== 'F' && trc.indStatus !== 'N') {
                trc.indBaixar = true;
            }
        });
        this.pop('success', 'Selecionados', '');
    }

    onSetaDataEValor(): void {
        this.tituloReceberCheques.forEach(trc => {
            if (trc.indBaixar === true && trc.indStatus !== 'F' &&
                trc.indStatus !== 'N' && (trc.chequeRecebidoId == null || trc.chequeRecebidoId === 0)) {
                trc.indBaixar = true;
                trc.vlrBaixar = trc.vlrTotal;
                trc.dtaBaixar = moment().format('YYYY-MM-DD');
            }
        });
        this.pop('success', 'Setado', '');
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

    msgAlertaTitulos(titulo: string, validaTitulos: ValidaTituloAux[], tipo: string): void {
        const activeModal = this._modalService.open(
            AppTituloModalAlertValidComponent, { backdrop: true });
        activeModal.componentInstance.modalHeader = titulo;
        activeModal.componentInstance.validaTitulos = validaTitulos;
        activeModal.componentInstance.modalType = tipo;
        activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
    }
}
