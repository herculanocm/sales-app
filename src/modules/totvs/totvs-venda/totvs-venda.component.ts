import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit, ElementRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { AppTituloModalAlertComponent } from '../modals/app-titulo-modal-alert/app-titulo-modal-alert.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import 'moment/locale/pt-br';
import moment from 'moment';
import 'moment/locale/pt-br';
import { TotvsService } from '../totvs.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, lastValueFrom, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserSalesAppAux } from '@app/app.utils';
import { ClienteService, EstoqueAlmoxarifadoService, FuncionarioService, VendaService } from '@modules/shared/services';
import { ClienteDTO } from '@modules/shared/models/cliente';
import { FuncionarioDTO } from '@modules/shared/models/funcionario';
import { VendaStatusLabelDTO } from '@modules/shared/models/venda';
import { PcFilial, VendaIntPesquisa, VendaIntTotvs, VendaIntTransfObjTotvs, VendaIntTransfTotvs } from '@modules/shared/models/totvs';
import { AppFilialComponent } from '../modals/app-filial-modal-confirm/app-filial-modal-confirm.component';
import { EstoqueAlmoxarifadoDTO } from '@modules/shared/models/item';

@Component({
    selector: 'app-totvs-venda',
    templateUrl: './totvs-venda.component.html',
    styleUrls: ['./totvs-venda.component.scss'],
})
export class TotvsVendaComponent implements OnInit, AfterViewInit {

    @ViewChild('preVenda') preVenda: ElementRef | undefined;
    ColumnMode: any;
    submitted: boolean;
    statusForm: number;
    selectionTypeSingle = SelectionType.single;
    almoxarifados: EstoqueAlmoxarifadoDTO[] = [];

    filiais: PcFilial[] = [];

    pesqForm!: FormGroup;

    vendedores: FuncionarioDTO[] | null = [];

    selected: any[] = [];
    vendaStatusLabels!: VendaStatusLabelDTO[] | null;
    currentUserSalesApp!: CurrentUserSalesAppAux;
    vendaIntTotvs: VendaIntTotvs[] = [];

    flgPesquisandoCliente!: number;
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


    @ViewChild(DatatableComponent) table!: DatatableComponent;

    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private spinner: NgxSpinnerService,
        private _modalService: NgbModal,
        private _vendaService: VendaService,
        private _service: TotvsService,
        private _clienteService: ClienteService,
        private _funcionarioService: FuncionarioService,
        private _alx: EstoqueAlmoxarifadoService,
    ) {
        this.submitted = false;
        this.statusForm = 1;
        this.ColumnMode = ColumnMode;

    }

    async ngOnInit() {
        this.createForm();
        await this.iniciaObjs();
        this.currentUserSalesApp = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);
        // this.getAllFiliais();
        this.cdr.detectChanges();
    }


    ngAfterViewInit() {
        this.preVenda!.nativeElement.focus();
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

    get f() { return this.pesqForm.controls; }

    createForm(): void {
        this.pesqForm = new FormGroup({
            dtaEmissao: new FormControl(this.convertDate(new Date(), 0), [Validators.required]),
            statusVenda: new FormControl(null),
            clienteId: new FormControl(null),
            clienteDTO: new FormControl(null),
            transferido: new FormControl('T'),
            vendedorId: new FormControl(null),
            vendaId: new FormControl(null),
            estoqueAlmoxarifadoId: new FormControl(null),
            filial: new FormControl<string | null>("1", [Validators.required]),
            destinoTipo: new FormControl<string | null>("prevenda", [Validators.required]),
            origem: new FormControl(null),
        });
    }

    compareStatus(s1: VendaStatusLabelDTO, s2: VendaStatusLabelDTO): boolean {
        return s1 && s2 ? s1.sigla === s2.sigla : s1 === s2;
    }

    compareAlmoxarifado(s1: EstoqueAlmoxarifadoDTO, s2: EstoqueAlmoxarifadoDTO): boolean {
        return s1 && s2 ? s1.id === s2.id : s1 === s2;
    }

    onReset() {
        this.submitted = false;
        this.pesqForm.reset();
        this.pesqForm.patchValue({
            transferido: 'T',
            dtaEmissao: this.convertDate(new Date(), 0),
            filial: "1",
            destinoTipo: "prevenda",
            origem: null
        });
    }
    async iniciaObjs(): Promise<void> {
        this.initDefaults();

        const valueStatus: any = await lastValueFrom(this._vendaService.getVendaStatusLabels());

        this.vendaStatusLabels = valueStatus;

        const valueVendedores: any = await lastValueFrom(this._funcionarioService.getAllActiveVendedor());
        this.vendedores = valueVendedores;

        const valueFiliais: any = await lastValueFrom(this._service.getAllPcFilials());
        this.filiais = valueFiliais;

        const alx: any = await lastValueFrom(this._alx.getAll());
        this.almoxarifados = [...alx];

        this.cdr.detectChanges();
    }
    initDefaults(): void {
        this.statusForm = 1;
        this.submitted = false;
        this.flgPesquisandoCliente = 0;
        this.vendaIntTotvs = [];
        this.vendedores = [];
    }

    getAllAlxs(): void {
        this._alx.getAll()
            .subscribe({
                next: (data) => {
                    this.almoxarifados = [...data];
                },
                error: () => {
                    this.toastr.error('Erro ao buscar os almoxarifados', 'Atenção');
                }
            });
    }

    getAllFiliais(): void {
        this._service.getAllPcFilials()
            .subscribe({
                next: (data) => {
                    this.filiais = data;
                    this.cdr.markForCheck();
                    console.log(this.filiais);
                },
                error: () => {
                    this.toastr.error('Erro ao buscar as filiais', 'Atenção');
                }
            });
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
        this._clienteService.findById(id)
            .subscribe({
                next: (data) => {
                    // console.log(data);
                    this.setaModelAndFormCliente(data);
                    this.pop('success', 'Cliente encontrado com sucesso', '');
                    this.flgPesquisandoCliente = 0;
                    this.cdr.detectChanges();
                },
                error: (err) => {
                    this.flgPesquisandoCliente = 0;
                    this.pop('error', 'Erro', 'Não foi encontrado cliente com esse codigo');
                    this.cdr.detectChanges();
                }
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

    async onLimpa(): Promise<void> {
        this.onReset();
        await this.iniciaObjs();
        this.pop('success', 'Limpo com sucesso', '');
        this.cdr.detectChanges();
        this.preVenda!.nativeElement.focus();
    }

    onSelecionaTodos(): void {
        this.vendaIntTotvs.forEach(trc => {
            if (trc.dtaTransfTotvs == null) {
                trc.acaoTransf = true;
            }
        });
        this.pop('success', 'Selecionados', '');
    }

    onDesSelecionaTodos(): void {
        this.vendaIntTotvs.forEach(trc => {
            trc.acaoTransf = false;
        });
        this.pop('success', 'Desselecionados', '');
    }

    compareVendedor(v1: FuncionarioDTO, v2: FuncionarioDTO): boolean {
        return v1 && v2 ? v1.id === v2.id : v1 === v2;
    }

    getRowClass(row: VendaIntTotvs) {
        return {
            'classe-fechado': row.indTransfTotvs != null && row.indTransfTotvs == true,
            'classe-alerta': row.indTransfTotvs == null || row.indTransfTotvs == false,
        };
    }

    compareFilial(c1: PcFilial, c2: PcFilial): boolean {
        return c1 && c2 ? c1.codigo === c2.codigo : c1 === c2;
    }

    onTransferirSelecionados(): void {
        this.submitted = true;
        const values = this.pesqForm.getRawValue();

        if (this.pesqForm.invalid) {
            this.msgAlerta('Atenção', 'Existe campos que ainda precisam ser preenchidos', 'error');
        } else {

            const sel = this.vendaIntTotvs.filter(vi => {
                return vi.acaoTransf == true;
            });

            if (sel.length == 0) {
                this.msgAlerta('Atenção', 'Selecione pelo menos uma venda para transferir', 'warning');
            } else {

                const obj = new VendaIntTransfObjTotvs();
                obj.vendas = [];

                sel.forEach(vv => {
                    const vobj = new VendaIntTransfTotvs();
                    vobj.id = vv.id;
                    vobj.acaoTransf = true;
                    obj.vendas.push(vobj);
                });




                obj.codigo = values.filial;
                obj.destinoTipo = values.destinoTipo;
                console.log(obj);

                this.spinner.show('fullSpinner');
                this._service.transferVendas(obj)
                    .subscribe({
                        next: (data) => {
                            this.spinner.hide('fullSpinner');
                            if (data.status == null || data.status == false) {
                                this.msgAlerta('Atenção', data.msg, 'warning');
                            } else {
                                this.msgAlerta('Atenção', data.msg, 'success');
                            }

                            this.vendaIntTotvs.forEach(trc => {
                                data.vendas.forEach(dvd => {
                                    if (trc.id == dvd.id) {
                                        trc.dtaTransfTotvs = dvd.dtaTransfTotvs;
                                        trc.usuarioTransfTotvs = dvd.usuarioTransfTotvs;
                                        trc.indTransfTotvs = dvd.indTransfTotvs;
                                        trc.numPedTotvs = dvd.numPedTotvs;
                                        trc.filialTotvs = data.codigo;
                                        trc.destinoTipoTotvs = dvd.destinoTipoTotvs;
                                        trc.numnf = dvd.numnf;

                                        trc.acaoTransf = false;
                                    }
                                });
                            });

                            this.cdr.detectChanges();
                            this.vendaIntTotvs = [...this.vendaIntTotvs];
                            this.cdr.detectChanges();
                        },
                        error: (error) => {
                            this.spinner.hide('fullSpinner');
                            console.log(error);
                            this.msgAlerta('Atenção', 'Erro, contate o administrador', 'error');
                            this.cdr.detectChanges();
                        }
                    });




                // this.spinner.show('fullSpinner');
                // this._service.transferVendas(obj)
                //     .subscribe({
                //         next: (data) => {
                //             this.spinner.hide('fullSpinner');
                //             if (data.status == null || data.status == false) {
                //                 this.msgAlerta('Atenção', data.msg, 'warning');
                //             } else {
                //                 this.msgAlerta('Atenção', data.msg, 'success');
                //             }




                //             this.vendaIntTotvs.forEach(trc => {
                //                 data.vendas.forEach(dvd => {
                //                     if (trc.id == dvd.id) {
                //                         trc.dtaTransfTotvs = dvd.dtaTransfTotvs;
                //                         trc.usuarioTransfTotvs = dvd.usuarioTransfTotvs;
                //                         trc.indTransfTotvs = dvd.indTransfTotvs;
                //                         trc.numPedTotvs = dvd.numPedTotvs;


                //                         trc.acaoTransf = false;
                //                     }
                //                 });
                //             });

                //             this.cdr.detectChanges();
                //             this.vendaIntTotvs = [...this.vendaIntTotvs];
                //             this.cdr.detectChanges();
                //         },
                //         error: (error) => {
                //             this.spinner.hide('fullSpinner');
                //             console.log(error);
                //             this.msgAlerta('Atenção', 'Erro, contate o administrador', 'error');
                //             this.cdr.detectChanges();
                //         }
                //     });
            }
        }
    }


    onPesquisa(): void {
        this.submitted = true;

        if (this.pesqForm.invalid) {
            this.msgAlerta('Atenção', 'Existe campos que ainda precisam ser preenchidos', 'error');
        } else {
            this.spinner.show('fullSpinner');
            const values = this.pesqForm.getRawValue();
            console.log(values);
            let vip = new VendaIntPesquisa();
            vip = values;
            console.log(vip);

            if (vip.vendaId != null && vip.vendaId > 0) {
                vip.dtaEmissao = null;
            }

            this._service.findVendasIntAux(vip)
                .subscribe({
                    next: (data) => {
                        this.spinner.hide('fullSpinner');
                        this.vendaIntTotvs = data;
                        // console.log(data);
                        this.cdr.detectChanges();
                        if (this.vendaIntTotvs.length === 0) {
                            this.pop('warning', 'Atenção - Não foi encontrado nada na pesquisa', '');
                        }
                    },
                    error: (error) => {
                        this.spinner.hide('fullSpinner');
                        console.log(error);
                        this.msgAlerta('Atenção', 'Erro, contate o administrador', 'error');
                        this.cdr.detectChanges();
                    }
                });
        }
    }

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    convertDate(inputFormat: any, dia: any) {
        function pad(s: number) {
            return (s < 10) ? '0' + s : s;
        }
        const d = new Date(inputFormat);
        return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate() + dia)].join('-');
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
        const nameReport = 'itens_sales_totvs_' + this.currentUserSalesApp.username + '_' + dtaAtualUser;
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
                'ID_SALES',
                'ID_AUX',
                'NOME_SALES',
                'CODPROD_TOTVS',
                'DESCRICAO_TOTVS',
                'EMBALAGEM_TOTVS',
                'UNIDADE_TOTVS',
                'QTUNIT_TOTVS',
                'QTUNITCX_TOTVS',
                'DTCADASTRO_TOTVS'
            ],
        };
        const data = [];

        this.itemPcProduts.forEach((ic: ItemPcProdut) => {
            const obj = {
                ID_SALES: ic.id,
                ID_AUX: ic.idAux,
                NOME_SALES: ic.nome,
                CODPROD_TOTVS: ic.codProd,
                DESCRICAO_TOTVS: ic.descricao,
                EMBALAGEM_TOTVS: ic.embalagem,
                UNIDADE_TOTVS: ic.unidade,
                QTUNIT_TOTVS: ic.qtunit,
                QTUNITCX_TOTVS: ic.qtUnitcx,
                DTCADASTRO_TOTVS: ic.dtCadastro
            };
            data.push(obj);
        });

        const csv = new ngxCsv(data, nameReport, options);
        */
    }
}
