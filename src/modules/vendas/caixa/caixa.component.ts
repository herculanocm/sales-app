import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import 'moment/locale/pt-br';
import { MessageAlertList } from '../modals/app-venda-modal-alert-list/app-venda-modal-alert-list-utils';
import { AppVendaModalAlertListComponent } from '../modals/app-venda-modal-alert-list/app-venda-modal-alert-list.component';
import { AppVendaModalAlertComponent } from '../modals/app-venda-modal-alert/app-venda-modal-alert.component';
import { AppVendaModalConfirmComponent } from '../modals/app-venda-modal-confirm/app-venda-modal-confirm.component';
import { AppVendaModalRomaneioComponent } from '../modals/app-venda-modal-romaneio/app-venda-modal-romaneio.component';
import { AppVendaModalCaixaRowComponent } from '../modals/app-venda-modal-caixa-row/app-venda-modal-caixa-row.component';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserSalesAppAux } from '@modules/shared/models/generic';
import { CaixaDTO, CaixaMovDTO, CaixaPesquisaDTO, CaixaResultado, CaixaSubTipoMovDTO, CaixaTipoAux, CaixaTipoMovDTO, PageCaixa, Referencia } from '@modules/shared/models/caixa';
import { EstoqueAlmoxarifadoDTO } from '@modules/shared/models/item';
import { CaixaService } from '@modules/shared/services/caixa.service';
import { EstoqueAlmoxarifadoService, UsuarioService } from '@modules/shared/services';
import { UserDTO } from '@modules/shared/models/usuario';

@Component({
    selector: 'app-caixa',
    templateUrl: './caixa.component.html',
    styleUrls: ['./caixa.component.scss'],
})
export class CaixaComponent implements OnInit, AfterViewInit {

    @ViewChild('dataRefId') dataRefId: ElementRef | undefined;
    ColumnMode = ColumnMode;
    submitted: boolean;
    submittedMov: boolean;
    statusForm: number;
    caixaForm!: FormGroup;
    selected: any[] = [];
    selectedMovs: any[] = [];
    flgPesquisando: number;
    usuarios: UserDTO[] = [];

    currentUserSalesApp!: CurrentUserSalesAppAux;

    caixaPesquisaDTO!: CaixaPesquisaDTO;
    caixaDTO!: CaixaDTO;
    pageCaixa!: PageCaixa;

    caixaTipoMovDTOs!: CaixaTipoMovDTO[] | undefined;
    caixaTipoMovDTOsFilter: CaixaTipoMovDTO[];
    caixaTipoAuxs!: CaixaTipoAux[];
    caixaSubTiposFilter: CaixaSubTipoMovDTO[];

    caixaMovDTOs: CaixaMovDTO[];

    estoqueAlmoxarifados: EstoqueAlmoxarifadoDTO[];
    caixaResultado: CaixaResultado[];
    selectionTypeSingle = SelectionType.single;

    constructor(
        private cdr: ChangeDetectorRef,
        private _modalService: NgbModal,
        private _caixaService: CaixaService,
        private spinner: NgxSpinnerService,
        private router: Router,
        private _estoqueAlmoxarifado: EstoqueAlmoxarifadoService,
        private toastr: ToastrService,
        private _usuarioService: UsuarioService,
    ) {
        this.submitted = false;
        this.submittedMov = false;
        this.statusForm = 1;
        this.ColumnMode = ColumnMode;
        this.flgPesquisando = 0;
        this.caixaTipoMovDTOsFilter = [];
        this.caixaSubTiposFilter = [];
        this.caixaMovDTOs = [];
        this.estoqueAlmoxarifados = [];
        this.caixaResultado = [];
    }

    ngAfterViewInit() {
        this.dataRefId!.nativeElement.focus();
    }

    get f() { return this.caixaForm.controls; }

    get m() {
        const formMov = this.caixaForm.get('mov') as FormGroup;
        return formMov.controls;
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
    }

    getAllUsers(): void {
        this._usuarioService.getUsers()
            .subscribe({
                next: (users: UserDTO[]) => {
                    this.usuarios = users;
                    this.cdr.markForCheck();
                },
                error: (err) => {
                    console.log(err);
                }
            });
    }

    onCadastra(): void {
        this.submitted = true;
        const formMov = this.caixaForm.get('mov') as FormGroup;
        formMov.disable();

        if (this.caixaForm.invalid) {
            this.msgAlerta('Atenção', 'Existe campos que ainda precisam ser preenchidos', 'error');
        } else {
            this.caixaDTO = this.caixaForm.getRawValue();
            this.caixaDTO.caixaMovDTOs = this.caixaMovDTOs;
            this.caixaDTO.caixaResultado = {
                caixaResultado: this.caixaResultado
            };

            this.spinner.show('fullSpinner');
            this._caixaService.postOrPut(this.caixaDTO, this.statusForm)
                .subscribe({
                    next: (data) => {

                        this.spinner.hide('fullSpinner');
                        formMov.enable();

                        this.dtoToForm(data);
                        this.statusForm = 2;
                        this.pageCaixa.content = [];
                        this.cdr.markForCheck();
                    },
                    error: (error) => {
                        this.spinner.hide('fullSpinner');
                        formMov.enable();
                        if (Object.prototype.hasOwnProperty.call(error, 'error') && error.error != null) {
                            const messAL: MessageAlertList[] = [];

                            if (Object.prototype.hasOwnProperty.call(error.error, 'fieldErrors') && error.error.fieldErrors != null
                                && error.error.fieldErrors.length > 0) {
                                for (let i = 0; i < error.error.fieldErrors.length; i++) {
                                    const mess = new MessageAlertList();
                                    mess.erro = error.error.fieldErrors[i].code;
                                    mess.message = error.error.fieldErrors[i].message;
                                    messAL.push(mess);
                                }
                            }

                            this.msgAlertaList(error.error.message, messAL, 'error');
                        }
                        this.cdr.markForCheck();
                    }
                });
        }
    }

    msgAlertaList(header: string, messAList: MessageAlertList[], modalType: string): void {
        // console.log('alert list');
        // console.log(messAList);
        const activeModal = this._modalService.open(
            AppVendaModalAlertListComponent, { size: 'lg', scrollable: true, backdrop: true });
        activeModal.componentInstance.modalHeader = header;
        activeModal.componentInstance.modalMessageList = messAList;
        activeModal.componentInstance.modalType = modalType;
        activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
    }

    async onLimpa(): Promise<void> {
        this.onReset();
        await this.iniciaObjs();
        this.cdr.markForCheck();
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

        this.caixaPesquisaDTO = new CaixaPesquisaDTO();
        // this.caixaPesquisaDTO.dtaInicialPesquisa = moment().format('YYYY-MM-DD');
        // this.caixaPesquisaDTO.dtaFinalPesquisa = moment().format('YYYY-MM-DD');

        this.caixaDTO = new CaixaDTO();

        this.pageCaixa = new PageCaixa();
        this.pageCaixa.content = [];

        this.caixaTipoAuxs = [];
        const obj1 = new CaixaTipoAux();
        obj1.nome = 'Entrada';
        obj1.sigla = 'E';
        const obj2 = new CaixaTipoAux();
        obj2.nome = 'Saida';
        obj2.sigla = 'S';

        this.caixaTipoAuxs.push(obj1);
        this.caixaTipoAuxs.push(obj2);

        this.initTotaisCondicao();


        this.caixaTipoMovDTOs = await this._caixaService.getAllCaixaTipoMovActive().toPromise();
        this.getFormSiglaTipoSubMov();

        this.getEstoqueAlmoxarifados();
        this.getAllUsers();
        this.cdr.markForCheck();
    }

    getValorTotalEntrada(): number {
        let vlrTotal = 0;
        this.caixaResultado.forEach(cr => {
            vlrTotal += cr.vlrEntrada;
        });
        return vlrTotal;
    }

    getValorTotalSaida(): number {
        let vlrTotal = 0;
        this.caixaResultado.forEach(cr => {
            vlrTotal += cr.vlrSaida;
        });
        return vlrTotal;
    }

    getValorTotalDif(): number {
        let vlrTotal = 0;
        this.caixaResultado.forEach(cr => {
            vlrTotal += cr.vlrDif;
        });
        return vlrTotal;
    }

    getValorTotalEntradaTable(row: any): number {
        let vlrTotal = 0;
        row.caixaResultado.caixaResultado.forEach((cr: any) => {
            vlrTotal += cr.vlrEntrada;
        });
        return vlrTotal;
    }

    getValorTotalSaidaTable(row: any): number {
        let vlrTotal = 0;
        row.caixaResultado.caixaResultado.forEach((cr: any) => {
            vlrTotal += cr.vlrSaida;
        });
        return vlrTotal;
    }

    getValorTotalDifTable(row: any): number {
        let vlrTotal = 0;
        row.caixaResultado.caixaResultado.forEach((cr: any) => {
            vlrTotal += cr.vlrDif;
        });
        return vlrTotal;
    }

    getFormSiglaTipoSubMov(): void {
        const controls = this.m;
        const sigla = controls['movTipoSigla'].value;
        this.setSubTipoMov(sigla);
    }

    getEstoqueAlmoxarifados(): void {
        this._estoqueAlmoxarifado.getAllActive()
            .subscribe((data) => {
                this.estoqueAlmoxarifados = data;
                this.cdr.markForCheck();
            }, (error) => { console.log(error) });
    }

    setSubTipoMov(sigla?: string): void {
        const controls = this.m;

        this.caixaSubTiposFilter = [];
        this.caixaTipoMovDTOsFilter = [];

        controls['movSubTipoSigla'].setValue(null);
        controls['caixaTipoMovDTO'].setValue(null);


        if (sigla == null || typeof (sigla) == 'undefined' || sigla.length === 0) {
            sigla = 'I';
        }

        this.caixaTipoMovDTOs!.forEach(ct => {
            let exite = false;

            this.caixaSubTiposFilter.forEach(cs => {
                if (cs.id == ct.caixaSubTipoMovDTO.id) {
                    exite = true;
                }
            });
            if (exite == false && (sigla == 'I' || ct.caixaSubTipoMovDTO.sigla == sigla)) {
                this.caixaSubTiposFilter.push(ct.caixaSubTipoMovDTO);
            }
        });


        const fltCaixatipo = this.caixaTipoMovDTOs!.filter(c => {
            const flt = this.caixaSubTiposFilter.filter(cs => {
                return cs.id === c.caixaSubTipoMovDTO.id;
            });
            return flt.length > 0 ? true : false;
        });

        this.caixaTipoMovDTOsFilter = [...fltCaixatipo];
        this.cdr.markForCheck();
    }

    setCaixaTipoMovDTOsFilter(sigla?: string): void {
        this.caixaTipoMovDTOsFilter = [];
        if (sigla != null && typeof (sigla) != 'undefined' && sigla.length === 1) {
            const fltCaixatipo = this.caixaTipoMovDTOs!.filter(c => {
                return c.caixaSubTipoMovDTO.sigla == sigla;
            });

            this.caixaTipoMovDTOsFilter = [...fltCaixatipo];
        } else {
            this.caixaTipoMovDTOsFilter = [...this.caixaTipoMovDTOs!];
        }
    }

    getFormSiglaTipoMov(): void {
        const controls = this.m;
        const sigla = controls['movTipoSigla'].value;
        this.setCaixaTipoMovDTOsFilter(sigla);
    }

    onChangeSubTipoEntSaida(event: any): void {
        const controls = this.m;
        const subTipo: CaixaSubTipoMovDTO = controls['movSubTipoSigla'].value;

        if (subTipo != null) {
            controls['caixaTipoMovDTO'].setValue(null);
            this.caixaTipoMovDTOsFilter = [];

            const fltCaixatipo = this.caixaTipoMovDTOs!.filter(c => {
                return c.caixaSubTipoMovDTO.id == subTipo.id;
            });

            this.caixaTipoMovDTOsFilter = [...fltCaixatipo];
        }
        this.cdr.markForCheck();
    }

    onChangeTipoEntSaida(event: any): void {
        let siglaValue = null;
        if (event != null) {
            siglaValue = event.target.value;
        } else {
            siglaValue = 'E';
        }
        const controls = this.m;
        const sigla: string = siglaValue;
        controls['caixaTipoMovDTO'].setValue(null);
        this.setSubTipoMov(sigla);
        this.cdr.markForCheck();
    }

    ngOnInit(): void {
        this.currentUserSalesApp = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);

        this.createForm();
        this.iniciaObjs();
        this.cdr.markForCheck();
    }

    initDefaults(): void {
        this.statusForm = 1;
        this.submitted = false;
        this.submittedMov = false;
        this.caixaResultado = [];
    }

    voltar(): void {
        if (this.statusForm === 2) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }

    initTotaisCondicao(): void {
        this.caixaResultado = [];

        const d = new CaixaResultado();
        d.ordem = 1;
        d.condicao = 'DINHEIRO';
        d.vlrEntrada = 0;
        d.vlrSaida = 0;
        d.vlrDif = 0;

        const b = new CaixaResultado();
        b.ordem = 2;
        b.condicao = 'BOLETO';
        b.vlrEntrada = 0;
        b.vlrSaida = 0;
        b.vlrDif = 0;

        const c = new CaixaResultado();
        c.ordem = 3;
        c.condicao = 'CHEQUE';
        c.vlrEntrada = 0;
        c.vlrSaida = 0;
        c.vlrDif = 0;

        const ca = new CaixaResultado();
        ca.ordem = 4;
        ca.condicao = 'CARTÃO';
        ca.vlrEntrada = 0;
        ca.vlrSaida = 0;
        ca.vlrDif = 0;

        const p = new CaixaResultado();
        p.ordem = 5;
        p.condicao = 'PIX';
        p.vlrEntrada = 0;
        p.vlrSaida = 0;
        p.vlrDif = 0;

        const n = new CaixaResultado();
        n.ordem = 6;
        n.condicao = 'NOTA';
        n.vlrEntrada = 0;
        n.vlrSaida = 0;
        n.vlrDif = 0;

        const bn = new CaixaResultado();
        bn.ordem = 7;
        bn.condicao = 'BONIFICAÇÃO';
        bn.vlrEntrada = 0;
        bn.vlrSaida = 0;
        bn.vlrDif = 0;

        const tr = new CaixaResultado();
        tr.ordem = 8;
        tr.condicao = 'TROCA';
        tr.vlrEntrada = 0;
        tr.vlrSaida = 0;
        tr.vlrDif = 0;

        const o = new CaixaResultado();
        o.ordem = 9;
        o.condicao = 'OUTROS';
        o.vlrEntrada = 0;
        o.vlrSaida = 0;
        o.vlrDif = 0;

        this.caixaResultado.push(d);
        this.caixaResultado.push(b);
        this.caixaResultado.push(c);
        this.caixaResultado.push(ca);
        this.caixaResultado.push(p);
        this.caixaResultado.push(n);
        this.caixaResultado.push(bn);
        this.caixaResultado.push(tr);
        this.caixaResultado.push(o);
        this.cdr.markForCheck();
    }

    // dtaReferencia: new FormControl(this.convertDate(new Date(), 0), [Validators.required]),
    createForm(): void {
        this.caixaForm = new FormGroup({
            id: new FormControl<number | null>(null),
            dtaReferencia: new FormControl<Date | null>(null, [Validators.required]),

            descricao: new FormControl<string | null>(''),
            romaneioId: new FormControl<number | null>(null),


            mov: new FormGroup({
                movTipoSigla: new FormControl<string | null>('E'),
                movSubTipoSigla: new FormControl<string | null>(null),

                descricao: new FormControl<string | null>(''),
                ativo: new FormControl<boolean | null>(true),
                caixaTipoMovDTO: new FormControl<CaixaTipoMovDTO | null>(null, [Validators.required]),
                qtd: new FormControl<number | null>(0),
                usuarioCaixa: new FormControl<string | null>(null),

                dtaRef: new FormControl(null),

                

                vlrDinheiro: new FormControl<number | null>(0),
                vlrBoleto: new FormControl<number | null>(0),
                vlrCheque: new FormControl<number | null>(0),
                vlrCartao: new FormControl<number | null>(0),
                vlrPix: new FormControl<number | null>(0),
                vlrNota: new FormControl<number | null>(0),
                vlrBonificacao: new FormControl<number | null>(0),
                vlrTroca: new FormControl<number | null>(0),
                vlrOutros: new FormControl<number | null>(0),

                totalCheques: new FormControl<number | null>(null),

            }),

        });
    }


    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    onReset() {
        this.submitted = false;
        this.submittedMov = false;
        this.flgPesquisando = 0;
        this.caixaForm.reset();
        this.caixaForm.enable();
        this.caixaTipoMovDTOsFilter = [];
        this.caixaMovDTOs = [];

        this.caixaForm.reset();
        this.caixaForm.enable();
        // this.caixaForm.patchValue({
        //     dtaReferencia: this.convertDate(new Date(), 0)
        // });


        const formMov = this.caixaForm.get('mov') as FormGroup;
        formMov.patchValue({
            vlr: 0,
            qtd: 0,
            movTipoSigla: 'E',
            ativo: true
        });

        this.formClearValues();
        this.cdr.markForCheck();
    }

    unsetSelected(): void {
        if (this.selected != null) {
            this.selected.splice(0, this.selected.length);
        }
    }

    msgAlerta(titulo: string, conteudo: string, tipo: string): void {
        const activeModal = this._modalService.open(
            AppVendaModalAlertComponent, { backdrop: true });
        activeModal.componentInstance.modalHeader = titulo;
        activeModal.componentInstance.modalContent = conteudo;
        activeModal.componentInstance.modalType = tipo;
        activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
    }

    // AppVendaModalRomaneioComponent

    msgRomaneio(titulo: string, conteudo: string, tipo: string): void {
        const activeModal = this._modalService.open(
            AppVendaModalAlertComponent, { backdrop: true });
        activeModal.componentInstance.modalHeader = titulo;
        activeModal.componentInstance.modalContent = conteudo;
        activeModal.componentInstance.modalType = tipo;
        activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
    }

    dtoToForm(caixaDTO: CaixaDTO): void {
        this.caixaDTO = caixaDTO;
        this.caixaForm.patchValue({
            id: caixaDTO.id,
            dtaReferencia: caixaDTO.dtaReferencia,
            descricao: caixaDTO.descricao,
        });
        this.caixaForm.controls['id'].disable();

        this.caixaMovDTOs = [];
        this.caixaMovDTOs = [...this.caixaDTO.caixaMovDTOs];
        this.cdr.markForCheck();
        this.getTotalVlrChequeByCaixa();
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.pageCaixa.content.length; i++) {
                const id = this.caixaForm.controls['id'].value;
                if (id != null && !isNaN(id) && id === this.pageCaixa.content[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.dtoToForm(this.pageCaixa.content[i - 1]);
                        this.selected.push(this.pageCaixa.content[i - 1]);
                        i = this.pageCaixa.content.length + 1;
                    } else {
                        this.pop('error', 'Sem registro para mover, busque novamente ou pule a página', '');
                    }
                }
            }
        }
    }
    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.pageCaixa.content.length; i++) {
                const id = this.caixaForm.controls['id'].value;
                if (id != null && !isNaN(id) && id === this.pageCaixa.content[i].id) {
                    if ((i + 1) < this.pageCaixa.content.length) {
                        this.selected = [];
                        this.dtoToForm(this.pageCaixa.content[i + 1]);
                        this.selected.push(this.pageCaixa.content[i + 1]);
                        i = this.pageCaixa.content.length + 1;
                    } else {
                        this.pop('error', 'Sem registro para mover, busque novamente ou pule a página', '');
                    }
                }
            }
        }
    }

    onTable(): void {
        this.unsetSelected();
        if (this.pageCaixa != null && this.pageCaixa.content.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Erro', 'Procure primeiro.');
        }
    }

    editando(): void {
        this.spinner.show('fullSpinner');
        const sel: CaixaDTO[] = this.pageCaixa.content.filter(us => {
            return us.id === this.selected[0].id;
        });

        this.caixaDTO = sel[0];

        this.dtoToForm(this.caixaDTO);
        this.statusForm = 2;
        this.atualizaTotais();
        this.spinner.hide('fullSpinner');
        this.cdr.markForCheck();
    }

    setPage(pageInfo: any) {
        this.caixaPesquisaDTO.pageSize = pageInfo.pageSize;
        this.caixaPesquisaDTO.pageNumber = pageInfo.offset;
        this.pesquisaCaixa(this.caixaPesquisaDTO);
    }

    onPesquisaById(): void {
        const id: number = this.caixaForm.controls['id'].value;
        if (id !== null && id > 0) {
            this.onPesquisa();
        } else {
            this.toastr.warning('Adicione um valor de ID para procura', 'Atenção');
        }
    }

    onPesquisaCaixaByRomaneioId(): void {
        const romaneioId: number = this.caixaForm.controls['romaneioId'].value;
        if (romaneioId !== null && romaneioId > 0) {
            this.spinner.show('fullSpinner');
            this._caixaService.getCaixaIdsByRomaneioId(romaneioId)
                .subscribe({
                    next: (data) => {
                        console.log(data);
                        this.spinner.hide('fullSpinner');
                        if (data.list != null && data.list.length === 1) {
                            this.caixaForm.controls['id'].setValue(data.list[0]);
                            this.onPesquisaById();
                        } else if (data.list != null && data.list.length > 1) {
                            this.msgAlerta('Atenção', `Mais de um caixa encontrado, IDs: ${data.list.join(', ')}`, 'alert');
                        } else {
                            this.toastr.warning('Não foi encontrado caixa para o romaneio informado', 'Atenção');
                        }
                        this.cdr.markForCheck();
                    },
                    error: (error) => {
                        this.spinner.hide('fullSpinner');
                        this.toastr.warning('Não foi encontrado caixa para o romaneio informado', 'Atenção');
                        this.cdr.markForCheck();
                    }
                });
        } else {
            this.toastr.warning('Adicione um valor de ID para procura', 'Atenção');
        }
    }

    onPesquisa(): void {
        this.caixaPesquisaDTO.caixaDTO = this.caixaForm.getRawValue();
        // this.romaneioPesquisaDTO.romaneioDTO.vendaDTOs = this.vendaDTOs;
        this.pesquisaCaixa(this.caixaPesquisaDTO);
    }

    pesquisaCaixa(caixaPesquisaDTO: CaixaPesquisaDTO): void {
        this.spinner.show('fullSpinner');
        this._caixaService.find(caixaPesquisaDTO)
            .subscribe({
                next: (data) => {
                    this.spinner.hide('fullSpinner');
                    console.log(data);
                    const pageCaixa = data;

                    this.pageCaixa = pageCaixa;


                    // Encontrar o status atual para cada venda dentro da rota
                    /*
                    for (let i = 0; i < this.pageRomaneio.content.length; i++) {
    
                        for (let j = 0; j < this.pageRomaneio.content[i].vendaDTOs.length; j++) {
    
                            if (this.pageRomaneio.content[i].vendaDTOs[j].vendaStatusAtualDTO == null) {
                                const statusAtual = this.pageRomaneio.content[i].vendaDTOs[j].vendaStatusDTOs.filter(vs => {
                                    return vs.flAtual === true;
                                });
                                this.pageRomaneio.content[i].vendaDTOs[j].vendaStatusAtual = statusAtual[0];
                            }
    
                        }
    
                    }
                    */


                    if (this.pageCaixa.content.length === 0) {
                        this.pop('error', 'Pesquisa', 'Não foi encontrado nada com essa pesquisa.');
                    } else {
                        // console.log('mais que 1');
                        this.statusForm = 3;
                    }
                    this.cdr.markForCheck();
                },
                error: () => {
                    this.spinner.hide('fullSpinner');
                    this.cdr.markForCheck();
                }
            });
    }

    convertDate(inputFormat: any, dia: any) {
        function pad(s: any) {
            return (s < 10) ? '0' + s : s;
        }
        const d = new Date(inputFormat);
        return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate() + dia)].join('-');
    }

    onDeleta(): void {
        console.log('iniciando');
        const id = this.caixaForm.controls['id'].value;
        if (id != null && !isNaN(id) && id > 0 && this.statusForm === 2) {
            const activeModal = this._modalService.open(AppVendaModalConfirmComponent);
            activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
            activeModal.componentInstance.modalContent = 'Deseja realmente excluir ?';
            activeModal.componentInstance.modalType = 'confirm';
            activeModal.componentInstance.defaultLabel = 'Não';
            activeModal.result.then((result) => {
                if (result === 'confirm') {
                    this.spinner.show('fullSpinner');
                    let message = '';
                    this._caixaService.del(id)
                        .subscribe({
                            next: async (resp: any) => {
                                this.spinner.hide('fullSpinner');
                                message = resp.message;
                                this.pop('success', 'OK', message);
                                await this.delay(1000);
                                this.onLimpa();
                                this.cdr.markForCheck();
                            },
                            error: (err) => {
                                this.spinner.hide('fullSpinner');
                                message = err.message;
                                this.pop('error', 'Erro', message);
                                this.cdr.markForCheck();
                            }
                        });
                }
            }, (error) => {
                this.cdr.markForCheck();
            });
        } else {
            this.msgAlerta('Atenção', `Selecione um registro de caixa primeiro,
            não é possível deletar sem um id válido`, 'alert');
        }
    }

    onRemoveMovimento(mov: any): void {
        const activeModal = this._modalService.open(AppVendaModalConfirmComponent);
        activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
        activeModal.componentInstance.modalContent = 'Deseja realmente remover o movimento ?';
        activeModal.componentInstance.modalType = 'confirm';
        activeModal.componentInstance.defaultLabel = 'Não';
        activeModal.result.then((result) => {
            if (result === 'confirm') {
                const caixaMovDTOTable: CaixaMovDTO = mov;
                for (let i = 0; i < this.caixaMovDTOs.length; i++) {
                    if (this.caixaMovDTOs[i].ordem === caixaMovDTOTable.ordem &&
                        this.caixaMovDTOs[i].usuarioInclusao === caixaMovDTOTable.usuarioInclusao) {
                        this.caixaMovDTOs.splice(i, 1);
                        this.caixaMovDTOs = [...this.caixaMovDTOs];
                        this.pop('success', 'Removido', '');
                    }
                }
                this.atualizaTotais();
                this.cdr.markForCheck();

                this.getTotalVlrChequeByCaixa();
            }
        }, (error) => { console.log(error) });
    }

    openPrintPage(): void {

        const id = new Date().getTime();
        const key = (this.currentUserSalesApp.username + '_' + id.toString() + '_' + this.caixaForm.controls['id'].value);
        console.log('key');
        console.log(key);


        this._caixaService.storageSet(key,
            {
                caixaDTO: this.caixaDTO
            })
            .subscribe((resp) => {
                console.log(resp);
                console.log('Deu tudo certo, vamos imprimir');
                this.cdr.markForCheck();
                const hrefFull = this._caixaService.hrefContext() + 'print/caixa/' + key;
                this.router.navigate([]).then(result => {
                    window.open(hrefFull, '_blank');
                });
                this.cdr.markForCheck();
            }, (error) => {
                console.log(error);
                this.pop('error', 'Erro ao tentar imprimir, contate o administrador', '');
                console.log('Erro ao tentar imprimir, contate o administrador, não salvou no indexdDB');
                this.cdr.markForCheck();
            });
    }

    getTotalVlrChequeByCaixa(): void {
        const caixaId = this.caixaForm.controls['id'].value;
        if (caixaId != null && caixaId > 0) {
            this._caixaService.getTotalChequesByCaixaId(caixaId)
            .subscribe({
                next: (data) => {
                    this.caixaDTO.totalCheques = data.total;
                    this.cdr.markForCheck();
                }
            });
        }
    }

    getTotalVlrChequeByCaixaTable(): number {
        let total = 0;
        if (this.caixaDTO != null && this.caixaDTO.totalCheques != null) {
            total = this.caixaDTO.totalCheques;
        }
        return total;
    }

    isUndefined(value: any): boolean {
        return typeof value === 'undefined';
    }

    addMovimento(): void {
        this.submittedMov = true;
        const formMov = this.caixaForm.get('mov') as FormGroup;

        if (formMov.invalid) {
            // this.msgAlerta('Atenção', 'Existe campos no movimento que ainda precisam ser preenchidos', 'error');
            this.pop('error', 'Atenção', 'Existe campos no movimento que ainda precisam ser preenchidos');
        } else {
            const caixaMovDTOForm: CaixaMovDTO = formMov.getRawValue();
            caixaMovDTOForm.usuarioInclusao = this.currentUserSalesApp.username;
            caixaMovDTOForm.dtaInclusao = null;
            caixaMovDTOForm.ordem = new Date().getTime();

            if (caixaMovDTOForm.caixaTipoMovDTO.id == 5 || caixaMovDTOForm.caixaTipoMovDTO.id == 89) {
                this.formClearValues();
                const tipo = (caixaMovDTOForm.caixaTipoMovDTO.id == 89 ? 'vendas' : 'romaneios');


                const activeModal = this._modalService.open(AppVendaModalRomaneioComponent);
                activeModal.componentInstance.estoqueAlmoxarifados = this.estoqueAlmoxarifados;
                activeModal.componentInstance.tipo = tipo;
                activeModal.componentInstance.usuarioCaixa = caixaMovDTOForm.usuarioCaixa;
                
                activeModal.result.then((result) => {

                    if (result != null && typeof (result.acao) != 'undefined' && result.acao === 'confirm') {
                        const referencia = new Referencia();
                        referencia.tipo = tipo;
                        referencia.dtaRef = result.dtaRef;
                        referencia.estoque = result.estoque;
                        referencia.formato = result.formato

                        if (this.estoqueAlmoxarifados != null && this.estoqueAlmoxarifados.length > 0) {
                            const sel = this.estoqueAlmoxarifados.filter(ft => {
                                return ft.id === referencia.estoque;
                            });

                            if (sel != null && sel.length === 1) {
                                referencia.estoqueNome = sel[0].nome;
                            }
                        }

                        caixaMovDTOForm.referencia = referencia;
                        caixaMovDTOForm.dtaRef = result.dtaRef;
                        caixaMovDTOForm.ativo = true;
                        caixaMovDTOForm.qtd = referencia.formato.length;

                        caixaMovDTOForm.vlrDinheiro = 0;
                        caixaMovDTOForm.vlrBoleto = 0;
                        caixaMovDTOForm.vlrCheque = 0;
                        caixaMovDTOForm.vlrCartao = 0;
                        caixaMovDTOForm.vlrPix = 0;
                        caixaMovDTOForm.vlrNota = 0;
                        caixaMovDTOForm.vlrBonificacao = 0;
                        caixaMovDTOForm.vlrTroca = 0;
                        caixaMovDTOForm.vlrOutros = 0;



                        if (tipo == 'vendas') {
                            referencia.formato.forEach((f: any) => {

                                if (f.condicao_pagamento_nome.toUpperCase().indexOf('DINHEIRO') > -1) {
                                    caixaMovDTOForm.vlrDinheiro += f.val_total;
                                } else if (f.condicao_pagamento_nome.toUpperCase().indexOf('BOLETO') > -1) {
                                    caixaMovDTOForm.vlrBoleto += f.val_total;
                                } else if (f.condicao_pagamento_nome.toUpperCase().indexOf('CHEQUE') > -1) {
                                    caixaMovDTOForm.vlrCheque += f.val_total;
                                } else if (f.condicao_pagamento_nome.toUpperCase().indexOf('CARTAO') > -1) {
                                    caixaMovDTOForm.vlrCartao += f.val_total;
                                } else if (f.condicao_pagamento_nome.toUpperCase().indexOf('PIX') > -1) {
                                    caixaMovDTOForm.vlrPix += f.val_total;
                                } else if (f.condicao_pagamento_nome.toUpperCase().indexOf('NOTA') > -1) {
                                    caixaMovDTOForm.vlrNota += f.val_total;
                                } else if (f.condicao_pagamento_nome.toUpperCase().indexOf('BONIFICACAO') > -1) {
                                    caixaMovDTOForm.vlrBonificacao += f.val_total;
                                } else if (f.condicao_pagamento_nome.toUpperCase().indexOf('TROCA') > -1) {
                                    caixaMovDTOForm.vlrTroca += f.val_total;
                                } else {
                                    caixaMovDTOForm.vlrOutros += f.val_total;
                                }

                            });
                        } else {
                            referencia.formato.forEach((f: any) => {

                                if (typeof (referencia.formato.vlr_troco_despesa) != 'undefined' &&
                                    referencia.formato.vlr_troco_despesa != null && referencia.formato.vlr_troco_despesa > 0) {
                                    caixaMovDTOForm.vlrDinheiro += referencia.formato.vlr_troco_despesa;
                                }

                                f.condicoes.condicoes.forEach((fc: any) => {

                                    if (fc.nome.toUpperCase().indexOf('DINHEIRO') > -1) {
                                        caixaMovDTOForm.vlrDinheiro += fc.vlr;
                                    } else if (fc.nome.toUpperCase().indexOf('BOLETO') > -1) {
                                        caixaMovDTOForm.vlrBoleto += fc.vlr;
                                    } else if (fc.nome.toUpperCase().indexOf('CHEQUE') > -1) {
                                        caixaMovDTOForm.vlrCheque += fc.vlr;
                                    } else if (fc.nome.toUpperCase().indexOf('CARTAO') > -1 || fc.nome.toUpperCase().indexOf('CARTÃO') > -1) {
                                        caixaMovDTOForm.vlrCartao += fc.vlr;
                                    } else if (fc.nome.toUpperCase().indexOf('PIX') > -1) {
                                        caixaMovDTOForm.vlrPix += fc.vlr;
                                    } else if (fc.nome.toUpperCase().indexOf('NOTA') > -1) {
                                        caixaMovDTOForm.vlrNota += fc.vlr;
                                    } else if (fc.nome.toUpperCase().indexOf('BONIFICACAO') > -1 || fc.nome.toUpperCase().indexOf('BONIFICAÇÃO') > -1) {
                                        caixaMovDTOForm.vlrBonificacao += fc.vlr;
                                    } else if (fc.nome.toUpperCase().indexOf('TROCA') > -1) {
                                        caixaMovDTOForm.vlrTroca += fc.vlr;
                                    } else {
                                        //console.log(fc);
                                        caixaMovDTOForm.vlrOutros += fc.vlr;
                                    }

                                });

                            });
                        }

                        this.addRowMov(caixaMovDTOForm);
                        this.cdr.markForCheck();
                        this.getTotalVlrChequeByCaixa();
                    }
                }, (error) => { console.log(error) });

            } else {
                caixaMovDTOForm.referencia = null;
                this.addRowMov(caixaMovDTOForm);
                this.cdr.markForCheck();
                this.getTotalVlrChequeByCaixa();
            }
        }
    }


    formClearValues(): void {
        const formMov = this.caixaForm.get('mov') as FormGroup;
        this.submittedMov = false;
        formMov.reset();
        formMov.enable();
        formMov.patchValue({
            vlrDinheiro: 0,
            vlrBoleto: 0,
            vlrCheque: 0,
            vlrCartao: 0,
            vlrPix: 0,
            vlrNota: 0,
            vlrTroca: 0,
            vlrBonificacao: 0,
            vlrOutros: 0,
            qtd: 0,
            movTipoSigla: 'E',
            ativo: true
        });
        this.onChangeTipoEntSaida(null);
    }

    addRowMov(caixaMovDTOForm: CaixaMovDTO): void {
        console.log(caixaMovDTOForm);
        // const formMov = this.caixaForm.get('mov') as FormGroup;
        this.caixaMovDTOs.push(caixaMovDTOForm);
        this.caixaMovDTOs = [...this.caixaMovDTOs];
        this.pop('success', 'Adicionado', '');
        this.formClearValues();
        this.atualizaTotais();
        this.cdr.markForCheck();
    }

    atualizaTotais(): void {
        this.initTotaisCondicao();
        this.caixaResultado.forEach(cr => {
            this.caixaMovDTOs.forEach(m => {
                if (m.ativo == true) {
                    if (cr.ordem == 1) {
                        cr.vlrEntrada += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == 'E' ? m.vlrDinheiro : 0;
                        cr.vlrSaida += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == 'S' ? m.vlrDinheiro : 0;
                    } else if (cr.ordem == 2) {
                        cr.vlrEntrada += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == 'E' ? m.vlrBoleto : 0;
                        cr.vlrSaida += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == 'S' ? m.vlrBoleto : 0;
                    } else if (cr.ordem == 3) {
                        cr.vlrEntrada += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == 'E' ? m.vlrCheque : 0;
                        cr.vlrSaida += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == 'S' ? m.vlrCheque : 0;
                    } else if (cr.ordem == 4) {
                        cr.vlrEntrada += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == 'E' ? m.vlrCartao : 0;
                        cr.vlrSaida += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == 'S' ? m.vlrCartao : 0;
                    } else if (cr.ordem == 5) {
                        cr.vlrEntrada += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == 'E' ? m.vlrPix : 0;
                        cr.vlrSaida += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == 'S' ? m.vlrPix : 0;
                    } else if (cr.ordem == 6) {
                        cr.vlrEntrada += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == 'E' ? m.vlrNota : 0;
                        cr.vlrSaida += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == 'S' ? m.vlrNota : 0;
                    } else if (cr.ordem == 7) {
                        cr.vlrEntrada += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == 'E' ? m.vlrBonificacao : 0;
                        cr.vlrSaida += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == 'S' ? m.vlrBonificacao : 0;
                    } else if (cr.ordem == 8) {
                        cr.vlrEntrada += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == 'E' ? m.vlrTroca : 0;
                        cr.vlrSaida += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == 'S' ? m.vlrTroca : 0;
                    } else {
                        cr.vlrEntrada += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == 'E' ? m.vlrOutros : 0;
                        cr.vlrSaida += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == 'S' ? m.vlrOutros : 0;
                    }
                }
            });
        });

        this.caixaResultado.forEach(cr => {
            cr.vlrDif = (cr.vlrEntrada - cr.vlrSaida);
        });
        this.cdr.markForCheck();
    }

    getVlrCondicao(ativo: boolean, tipoSigla: string, condicao: number): number {
        let valor = 0;

        this.caixaMovDTOs.forEach(m => {

            if (ativo == false) {
                valor = 0;
            } else {
                if (condicao == 1) {
                    valor += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == tipoSigla ? m.vlrDinheiro : 0;
                } else if (condicao == 2) {
                    valor += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == tipoSigla ? m.vlrBoleto : 0;
                } else if (condicao == 3) {
                    valor += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == tipoSigla ? m.vlrCheque : 0;
                } else if (condicao == 4) {
                    valor += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == tipoSigla ? m.vlrCartao : 0;
                } else if (condicao == 5) {
                    valor += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == tipoSigla ? m.vlrPix : 0;
                } else if (condicao == 6) {
                    valor += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == tipoSigla ? m.vlrNota : 0;
                } else if (condicao == 7) {
                    valor += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == tipoSigla ? m.vlrBonificacao : 0;
                } else if (condicao == 8) {
                    valor += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == tipoSigla ? m.vlrTroca : 0;
                } else {
                    valor += m.caixaTipoMovDTO.caixaSubTipoMovDTO.sigla == tipoSigla ? m.vlrOutros : 0;
                }
            }
        });

        return valor;
    }

    getAggrFieldsFromForm(): number {
        const formMov = this.caixaForm.get('mov') as FormGroup;
        const caixaMovDTOForm: CaixaMovDTO = formMov.getRawValue();

        const aggr = (
            caixaMovDTOForm.vlrDinheiro +
            caixaMovDTOForm.vlrBoleto +
            caixaMovDTOForm.vlrCheque +
            caixaMovDTOForm.vlrCartao +
            caixaMovDTOForm.vlrPix +
            caixaMovDTOForm.vlrNota +
            caixaMovDTOForm.vlrBonificacao +
            caixaMovDTOForm.vlrTroca +
            caixaMovDTOForm.vlrOutros
            );

        return aggr;
    }

    getVlrDinheiro(): number {
        let valor = 0;

        this.caixaMovDTOs.forEach(m => {
            valor += m.ativo == true ? m.vlrDinheiro : 0;
        });

        return valor;
    }

    getVlrBoleto(): number {
        let valor = 0;
        this.caixaMovDTOs.forEach(m => {
            valor += m.ativo == true ? m.vlrBoleto : 0;
        });
        return valor;
    }

    getVlrCheque(): number {
        let valor = 0;
        this.caixaMovDTOs.forEach(m => {
            valor += m.ativo == true ? m.vlrCheque : 0;
        });
        return valor;
    }

    getVlrCartao(): number {
        let valor = 0;
        this.caixaMovDTOs.forEach(m => {
            valor += m.ativo == true ? m.vlrCartao : 0;
        });
        return valor;
    }

    getVlrPix(): number {
        let valor = 0;
        this.caixaMovDTOs.forEach(m => {
            valor += m.ativo == true ? m.vlrPix : 0;
        });
        return valor;
    }

    getVlrNota(): number {
        let valor = 0;
        this.caixaMovDTOs.forEach(m => {
            valor += m.ativo == true ? m.vlrNota : 0;
        });
        return valor;
    }

    getVlrBonificacao(): number {
        let valor = 0;
        this.caixaMovDTOs.forEach(m => {
            valor += m.ativo == true ? m.vlrBonificacao : 0;
        });
        return valor;
    }

    getVlrOutros(): number {
        let valor = 0;
        this.caixaMovDTOs.forEach(m => {
            valor += m.ativo == true ? m.vlrOutros : 0;
        });
        return valor;
    }

    getVlrTroca(): number {
        let valor = 0;
        this.caixaMovDTOs.forEach(m => {
            valor += m.ativo == true ? m.vlrTroca : 0;
        });
        return valor;
    }

    exibeRow(movRow: CaixaMovDTO): void {
        console.log(movRow);
        const activeModal = this._modalService.open(AppVendaModalCaixaRowComponent, { size: 'xl' });
        activeModal.componentInstance.caixaMov = movRow;
        activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
    }

    onActivateMovs(event: any) {
        if (
            (event.type === 'dblclick') ||
            (event.type === 'keydown' && event.event.keyCode === 13)
        ) {
            if (this.selectedMovs.length > 0) {
                this.exibeRow(this.selectedMovs[0]);
            } else {
                this.pop('error', 'Nenhuma linha selecionada', '');
            }
        }
        this.cdr.markForCheck();
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
