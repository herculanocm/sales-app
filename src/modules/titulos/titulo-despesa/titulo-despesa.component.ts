import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppTituloModalAlertListComponent } from '../modals/app-titulo-modal-alert-list/app-titulo-modal-alert-list.component';
import { MessageAlertList } from '../../vendas/modals/app-venda-modal-alert-list/app-venda-modal-alert-list-utils';
import { AppTituloModalAlertComponent } from '../modals/app-titulo-modal-alert/app-titulo-modal-alert.component';
import { AppTituloModalConfirmComponent } from '../modals/app-titulo-modal-confirm/app-titulo-modal-confirm.component';
import { saveAs as importedSaveAs } from 'file-saver';
import moment from 'moment';
import 'moment/locale/pt-br';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap, catchError } from 'rxjs/operators';
import { PageTituloDespesa, SubGrupoDespesaDTO, TituloDespesaDTO, TituloDespesaPesquisaDTO, TituloStatus, TituloTipoBaixa, TituloTipoDTO } from '@modules/shared/models/titulo';
import { BancoFebrabanDTO } from '@modules/shared/models/generic';
import { SubGrupoDespesaService, TituloDespesaService } from '@modules/shared/services';
import { FornecedorDTO } from '@modules/shared/models/fornecedor';

@Component({
    selector: 'app-titulo-despesa',
    templateUrl: './titulo-despesa.component.html',
    styleUrls: ['./titulo-despesa.component.scss'],
})
export class TituloDespesaComponent implements OnInit {

    ColumnMode: any;
    submitted: boolean;
    statusForm: number;
    tituloDespesaDTO!: TituloDespesaDTO;
    pageTituloDespesa!: PageTituloDespesa;
    tituloDespesaPesquisaDTO!: TituloDespesaPesquisaDTO;
    botaoGeraCSV!: string;
    flgPesquisandoFornecedor: number;
    selectionTypeSingle = SelectionType.single;
    tituloForm!: FormGroup;

    selected: any[] = [];

    bancoFebrabans: BancoFebrabanDTO[] | undefined | null = [];
    tituloTipos: TituloTipoDTO[] | undefined | null = [];
    tituloStatus: TituloStatus[] = [];
    tituloTipoBaixas: TituloTipoBaixa[] = [];
    subGruposDespesas: SubGrupoDespesaDTO[] | undefined | null = [];

    searchingFornecedor: boolean;
    searchFailedFornecedor: boolean;

    /* formatter */
    formatterFornecedor = (x: { nome: string }) => x.nome;
    /* formatter */


    searchFornecedor = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.searchingFornecedor = true),
            switchMap(term =>
                this._tituloDespesaService.findFornecedorByName(term)
                    .pipe(
                        tap(() => this.searchFailedFornecedor = false),
                        catchError(() => {
                            this.searchFailedFornecedor = true;
                            return of([]);
                        })),
            ), tap(() => this.searchingFornecedor = false))

    constructor(
        private toastr: ToastrService,
        private _modalService: NgbModal,
        private spinner: NgxSpinnerService,
        private _tituloDespesaService: TituloDespesaService,
        private _subGruposDespesaService: SubGrupoDespesaService,
        private cdr: ChangeDetectorRef,
    ) {
        this.submitted = false;
        this.statusForm = 1;
        this.ColumnMode = ColumnMode;
        this.flgPesquisandoFornecedor = 0;
        this.searchingFornecedor = false;
        this.searchFailedFornecedor = false;
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

    createForm(): void {
        this.tituloForm = new FormGroup({
            id: new FormControl<number | null>(null),
            dtaInclusao: new FormControl<Date | null>(null),
            usuarioInclusao: new FormControl<string | null>(''),
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
            indStatus: new FormControl<string | null>(null, [Validators.required]),
            tituloTipoDTO: new FormControl<TituloTipoDTO | null>(null, [Validators.required]),
            fornecedorDTO: new FormControl<FornecedorDTO | null>(null),
            subGrupoDespesaDTO: new FormControl<SubGrupoDespesaDTO | null>(null, [Validators.required]),
            codFornecedor: new FormControl<number | null>(null),
            tituloTipoBaixa: new FormControl<TituloTipoDTO | null>(null),
            indTipoBaixa: new FormControl<string | null>(null),
        });

        this.tituloForm.controls['tituloTipoBaixa'].disable();
    }

    get f() { return this.tituloForm.controls; }

    ngOnInit(): void {
        this.createForm();
        this.iniciaObjs();
    }

    async iniciaObjs(): Promise<void> {
        this.initDefaults();

        // delete this.tituloDespesaDTO;
        this.tituloDespesaDTO = new TituloDespesaDTO();

        // delete this.pageTituloDespesa;
        this.pageTituloDespesa = new PageTituloDespesa();
        this.pageTituloDespesa.content = [];

        // delete this.tituloDespesaPesquisaDTO;
        this.tituloDespesaPesquisaDTO = new TituloDespesaPesquisaDTO();
        this.tituloTipos = await this._tituloDespesaService.getTituloTipos().toPromise();
        this.bancoFebrabans = await this._tituloDespesaService.getBancoFebraban().toPromise();
        this.subGruposDespesas = await this._subGruposDespesaService.getAll().toPromise();

        this.subGruposDespesas = this.subGruposDespesas!.filter(flt => {
            return flt.status === true;
        });

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
    }


    initDefaults(): void {
        this.statusForm = 1;
        this.botaoGeraCSV = 'Gerar CSV';
        this.submitted = false;
        this.iniciaTituloStatus();
    }

    iniciaTituloStatus(): void {
        // delete this.tituloStatus;
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


        // delete this.tituloTipoBaixas;
        this.tituloTipoBaixas = [];

        const tituloTipoBaixa1 = new TituloTipoBaixa();
        tituloTipoBaixa1.sigla = 'M';
        tituloTipoBaixa1.nome = 'MANUAL';

        const tituloTipoBaixa2 = new TituloTipoBaixa();
        tituloTipoBaixa2.sigla = 'S';
        tituloTipoBaixa2.nome = 'SISTEMICA';

        this.tituloTipoBaixas.push(tituloTipoBaixa1);
        this.tituloTipoBaixas.push(tituloTipoBaixa2);

        this.searchingFornecedor = false;
        this.searchFailedFornecedor = false;
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
        const id = this.tituloForm.controls['id'].value;
        if (id != null && id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
        this.cdr.detectChanges();
    }

    geraCSV(): void {
        this.botaoGeraCSV = 'Gerando CSV';
        this._tituloDespesaService.geraCSV(this.tituloDespesaPesquisaDTO)
            .subscribe((data) => {
                // console.log(data);
                // console.log('realizando download do arquivo');
                const fileName = data.fileName;
                this.botaoGeraCSV = 'Gerando! Baixando CSV';
                this._tituloDespesaService.donwloadCSV(data.id)
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
                        console.log(err);
                        this.msgAlerta('Atenção', 'Erro ao fazer download do CSV', 'error');
                        this.cdr.detectChanges();
                    });
            }, (err) => {
                this.botaoGeraCSV = 'Gerar CSV';
                console.log(err);
                this.msgAlerta('Atenção', 'Erro ao gerar o CSV', 'error');
                this.cdr.detectChanges();
            });
    }

    onCadastra(): void {
        this.submitted = true;

        if (this.tituloForm.invalid) {
            this.msgAlerta('Atenção', 'Existe campos que ainda precisam ser preenchidos', 'error');
        } else {

            this.tituloDespesaDTO = this.tituloForm.getRawValue();
            this.tituloDespesaDTO.vlrTotal = this.getVlrTotal();

            // console.log(this.tituloDespesaDTO);

            this.spinner.show('fullSpinner');
            this._tituloDespesaService.postOrPut(this.tituloDespesaDTO, this.statusForm)
                .subscribe({
                    next: (data) => {
                        this.spinner.hide('fullSpinner');
                        // console.log(data);
                        this.dtoToForm(data);
                        this.statusForm = 2;
                        this.pageTituloDespesa.content = [];
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

        const dtaEmissao = this.tituloForm.controls['dtaEmissao'].value;
        const dtaVencimento = this.tituloForm.controls['dtaVencimento'].value;

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

        const dtaEmissao = this.tituloForm.controls['dtaEmissao'].value;
        const dtaLiquidacao = this.tituloForm.controls['dtaLiquidacao'].value;

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
        const vlrLiquidado: number = this.tituloForm.controls['vlrLiquidado'].value;

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
        const id = this.tituloForm.controls['id'].value;
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
                    this._tituloDespesaService.del(id)
                        .subscribe({
                            next: async (resp: any) => {
                                this.spinner.hide('fullSpinner');
                                message = resp.message;
                                // delete this.pageTituloDespesa;
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
        this.tituloDespesaPesquisaDTO.tituloDespesaDTO = this.tituloForm.getRawValue();
        this.pesquisaTitulo(this.tituloDespesaPesquisaDTO);
    }

    pesquisaTitulo(tituloDespesaPesquisaDTO: TituloDespesaPesquisaDTO): void {
        this.spinner.show('fullSpinner');
        this._tituloDespesaService.find(tituloDespesaPesquisaDTO)
            .subscribe({
                next: (data) => {
                    this.spinner.hide('fullSpinner');
                    console.log(data);
                    const pageData = data;

                    this.pageTituloDespesa = pageData;

                    this.pageTituloDespesa.content.forEach(el => {
                        el.diasAtraso = this.getDiasAtraso(el);
                    });

                    if (this.pageTituloDespesa.content.length === 0) {
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
        this.flgPesquisandoFornecedor = 0;
        this.pop('success', 'Limpo com sucesso', '');
        this.cdr.detectChanges();
    }
    selectBancoByCod(): void {
        const cod = this.tituloForm.controls['codBanco'].value;

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

    bancoSelecionado(): void {
        const banco: BancoFebrabanDTO = this.tituloForm.controls['bancoFebrabanDTO'].value;

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
        this.tituloForm.controls['tituloTipoBaixa'].disable();
    }

    dtoToForm(tituloDespesaDTO: TituloDespesaDTO): void {
        this.tituloDespesaDTO = tituloDespesaDTO;



        this.tituloForm.patchValue({
            id: tituloDespesaDTO.id,
            numTitulo: tituloDespesaDTO.numTitulo,
            dtaEmissao: tituloDespesaDTO.dtaEmissao,
            dtaVencimento: tituloDespesaDTO.dtaVencimento,
            descricao: tituloDespesaDTO.descricao,
            dtaLiquidacao: tituloDespesaDTO.dtaLiquidacao,
            vlrOriginal: tituloDespesaDTO.vlrOriginal,
            vlrTotal: tituloDespesaDTO.vlrTotal,
            vlrLiquidado: tituloDespesaDTO.vlrLiquidado,
            vlrJuros: tituloDespesaDTO.vlrJuros,
            vlrMulta: tituloDespesaDTO.vlrMulta,
            vlrDesconto: tituloDespesaDTO.vlrDesconto,
            vlrTaxaCobranca: tituloDespesaDTO.vlrTaxaCobranca,
            vlrDespesaAcessoria: tituloDespesaDTO.vlrDespesaAcessoria,
            indStatus: tituloDespesaDTO.indStatus,
            tituloTipoDTO: tituloDespesaDTO.tituloTipoDTO,
            fornecedorDTO: tituloDespesaDTO.fornecedorDTO,
            codFornecedor: (tituloDespesaDTO.fornecedorDTO != null &&
                tituloDespesaDTO.fornecedorDTO.id != null && tituloDespesaDTO.fornecedorDTO.id > 0 ?
                tituloDespesaDTO.fornecedorDTO.id : null),
            subGrupoDespesaDTO: tituloDespesaDTO.subGrupoDespesaDTO,
            indTipoBaixa: tituloDespesaDTO.indTipoBaixa,
        });
        this.tituloForm.controls['id'].disable();
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.pageTituloDespesa.content.length; i++) {
                const id = this.tituloForm.controls['id'].value;
                if (id != null && !isNaN(id) && id === this.pageTituloDespesa.content[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.dtoToForm(this.pageTituloDespesa.content[i - 1]);
                        this.selected.push(this.pageTituloDespesa.content[i - 1]);
                        i = this.pageTituloDespesa.content.length + 1;
                    } else {
                        this.pop('error', 'Sem registro para mover, busque novamente ou pule a página', '');
                    }
                }
            }
        }
        this.cdr.detectChanges();
    }
    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.pageTituloDespesa.content.length; i++) {
                const id = this.tituloForm.controls['id'].value;
                if (id != null && !isNaN(id) && id === this.pageTituloDespesa.content[i].id) {
                    if ((i + 1) < this.pageTituloDespesa.content.length) {
                        this.selected = [];
                        this.dtoToForm(this.pageTituloDespesa.content[i + 1]);
                        this.selected.push(this.pageTituloDespesa.content[i + 1]);
                        i = this.pageTituloDespesa.content.length + 1;
                    } else {
                        this.pop('error', 'Sem registro para mover, busque novamente ou pule a página', '');
                    }
                }
            }
        }
        this.cdr.detectChanges();
    }

    setPage(pageInfo: any) {
        // console.log(pageInfo);
        this.tituloDespesaPesquisaDTO.pageSize = pageInfo.pageSize;
        this.tituloDespesaPesquisaDTO.pageNumber = pageInfo.offset;
        this.pesquisaTitulo(this.tituloDespesaPesquisaDTO);
        this.cdr.detectChanges();
    }

    onTable(): void {
        this.unsetSelected();
        if (this.pageTituloDespesa != null && this.pageTituloDespesa.content.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Erro', 'Procure primeiro.');
        }
        this.cdr.detectChanges();
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

    compareSubGruposDespesas(v1: SubGrupoDespesaDTO, v2: SubGrupoDespesaDTO): boolean {
        return v1 && v2 ? v1.id === v2.id : v1 === v2;
    }

    compareTituloStatus(v1: string, v2: string): boolean {
        return v1 === v2;
    }

    compareTipoBaixa(v1: string, v2: string): boolean {
        return v1 && v2 ? v1 === v2 : v1 === v2;
    }

    getVlrTotal(): number {
        const vlrOriginal: number = this.tituloForm.controls['vlrOriginal'].value;
        const vlrJuros: number = this.tituloForm.controls['vlrJuros'].value;
        const vlrMulta: number = this.tituloForm.controls['vlrMulta'].value;
        const vlrTaxaCobranca: number = this.tituloForm.controls['vlrTaxaCobranca'].value;
        const vlrDespesaAcessoria: number = this.tituloForm.controls['vlrDespesaAcessoria'].value;

        return (vlrOriginal + vlrJuros + vlrMulta + vlrTaxaCobranca + vlrDespesaAcessoria);
    }

    getRowClass(row: TituloDespesaDTO) {
        return {
            'titulo-em-atraso': row.diasAtraso > 0,
        };
    }

    getDiasAtraso(row: TituloDespesaDTO): number {
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
        const sel: TituloDespesaDTO[] = this.pageTituloDespesa.content.filter(us => {
            return us.id === this.selected[0].id;
        });

        this.dtoToForm(sel[0]);
        this.statusForm = 2;
        this.cdr.detectChanges();
    }


    onActivate(event: any) {
        if (
            (event.type === 'dblclick') ||
            (event.type === 'keydown' && event.event.keyCode === 13)
        ) {
            this.editando();
        }
    }

    findFornecedorById(): void {
        const idFornecedor = this.tituloForm.controls['codFornecedor'].value;

        if (idFornecedor == null || isNaN(idFornecedor)) {
            this.pop('error', 'Erro', 'Digite um id valido para pesquisa');
        } else {

            this.selectForncedorByCod(idFornecedor);
        }
    }


    selectForncedorByCod(id: number): void {
        this.flgPesquisandoFornecedor = 1;
        this._tituloDespesaService.findFornecedorById(id)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.setaModelAndFormForncedor(data);
                    this.pop('success', 'Fornecedor encontrado com sucesso', '');
                    this.flgPesquisandoFornecedor = 0;
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.flgPesquisandoFornecedor = 0;
                    this.pop('error', 'Erro', 'Não foi encontrado fornecedor com esse codigo');
                    this.cdr.detectChanges();
                }
            });
    }

    setaModelAndFormForncedor(fornecedor: FornecedorDTO): void {
        this.tituloForm.patchValue({
            fornecedorDTO: fornecedor,
            codFornecedor: fornecedor.id,
        });
    }
    typeaHeadSelectFornecedor(event: any): void {
        this.selectForncedorByCod(event.item.id);
    }
}
// 237026570180000285740723825390
