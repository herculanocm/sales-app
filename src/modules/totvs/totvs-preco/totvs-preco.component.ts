import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BancoFebrabanDTO } from '../../configuracoes/banco-febraban';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { AppTituloModalAlertComponent } from '../modals/app-titulo-modal-alert/app-titulo-modal-alert.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import 'moment/locale/pt-br';
import 'moment/locale/pt-br';
import { TotvsService } from '../totvs.service';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserSalesAppAux } from '@app/app.utils';
import { ItemAlxPreco, ItemPcProdut } from '@modules/shared/models/totvs';
import { TituloTipoDTO } from '@modules/shared/models/titulo';
import { EstoqueAlmoxarifadoDTO } from '@modules/print/print-utils';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EstoqueAlmoxarifadoService } from '@modules/shared/services';
import { AppTotvsModalConfirmComponent } from '../modals/app-titulo-modal-confirm/app-titulo-modal-confirm.component';

@Component({
    selector: 'app-totvs-preco',
    templateUrl: './totvs-preco.component.html',
    styleUrls: ['./totvs-preco.component.scss'],
})
export class TotvsPrecoComponent implements OnInit {

    ColumnMode: any;
    submitted: boolean;
    statusForm: number;
    selectionTypeSingle = SelectionType.single;
    selected: any[] = [];
    ealxs: EstoqueAlmoxarifadoDTO[] = [];

    itemPcProduts: ItemPcProdut[] | undefined = [];
    rows: ItemPcProdut[] = [];

    bancoFebrabans!: BancoFebrabanDTO[];
    tituloTipos!: TituloTipoDTO[];

    currentUserSalesApp!: CurrentUserSalesAppAux;

    flgPesquisandoCliente!: number;
    flgPesquisandoEmissor!: number;

    @ViewChild(DatatableComponent) table!: DatatableComponent;

    itemsPrecos: ItemAlxPreco[] = [];
    itemsPrecosFiltered: ItemAlxPreco[] = [];

    buscaForm = new FormGroup({
        estoqueAlmoxarifadoId: new FormControl(null, [Validators.required]),
    });

    get f() { return this.buscaForm.controls; }

    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private spinner: NgxSpinnerService,
        private _modalService: NgbModal,
        private _service: TotvsService,
        private _estoqueAlmoxarifado: EstoqueAlmoxarifadoService,
    ) {
        this.submitted = false;
        this.statusForm = 1;
        this.ColumnMode = ColumnMode;
        this.flgPesquisandoCliente = 0;
    }

    ngOnInit() {
        this.iniciaObjs();
        this.currentUserSalesApp = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);
    }

    onPesquisa(): void {
        const rawValue = this.buscaForm.getRawValue();
        this.submitted = true;
        console.log(rawValue);
        if (this.buscaForm.invalid) {
            this.pop('warning', 'Atenção', 'Preencha os campos obrigatórios');
            return;
        } else {
            this.spinner.show('fullSpinner');
            this._service.fetchItensPrecos(rawValue.estoqueAlmoxarifadoId!)
                .subscribe({
                    next: (data) => {
                        this.spinner.hide('fullSpinner');
                        this.itemsPrecos = data;
                        this.itemsPrecos.forEach((item) => {
                            item.acaoTransf = false;
                        });

                        this.itemsPrecos.sort((a, b) => {
                            if (a.itemNome < b.itemNome) { return -1; }
                            if (a.itemNome > b.itemNome) { return 1; }
                            return 0;
                        });

                        this.itemsPrecosFiltered = [...this.itemsPrecos];
                        this.cdr.detectChanges();
                    },
                    error: () => {
                        this.spinner.hide('fullSpinner');
                        this.pop('error', 'Erro', 'Erro ao buscar os itens');
                    }
                });
        }
    }

    fetchEstoqueAlmoxarifado(): void {
        this._estoqueAlmoxarifado.getAllActive()
            .subscribe({
                next: (data) => {
                    this.ealxs = data;
                    this.cdr.detectChanges();
                },
                error: () => {
                    this.pop('error', 'Erro', 'Erro ao buscar os almoxarifados');
                }
            });
    }
    onTransferirSelecionados(): void {
        const temp = this.itemsPrecos!.filter(function (d) {
            return d.acaoTransf === true;
        });

        if (temp.length === 0) {
            this.toastr.error('Selecione pelo menos um item para transferir', '');
            return;
        }

        const activeModal = this._modalService.open(
            AppTotvsModalConfirmComponent, { backdrop: true });
        activeModal.componentInstance.modalHeader = 'Atenção';
        activeModal.componentInstance.modalContent = 'Deseja realmente transferir os itens selecionados?';
        activeModal.componentInstance.modalType = 'confirm';
        activeModal.componentInstance.defaultLabel = 'Não';
        activeModal.componentInstance.confirmLabel = 'Sim';
        activeModal.result.then((result) => {
            if (result === 'confirm') {
                this.spinner.show('fullSpinner');
                this._service.postItensPrecosWinthor(temp)
                    .subscribe({
                        next: (data) => {
                            this.spinner.hide('fullSpinner');
                            console.log(data);
                            this.pop('success', 'Sucesso', 'Itens transferidos com sucesso');
                            this.onLimpa();
                        },
                        error: (error) => {
                            this.spinner.hide('fullSpinner');
                            console.log(error);
                            this.pop('error', 'Erro', 'Erro ao transferir os itens');
                            this.cdr.markForCheck();
                        }
                    });
            }
        }, (error) => { console.log(error) });

    }
    onDesSelecionaTodos(): void {
        if (this.itemsPrecosFiltered.length > 0) {
            this.itemsPrecosFiltered.forEach((item) => {
                item.acaoTransf = false;
            });
            this.toastr.info('Todos os itens foram desmarcados', '');
        }
    }
    onSelecionaTodos(): void {
        if (this.itemsPrecosFiltered.length > 0) {
            let cont = 0;
            this.itemsPrecosFiltered.forEach((item) => {
                item.acaoTransf = true;
                cont++;
            });
            this.toastr.info(`${cont} itens selecionados`, '');
        }
    }
    onReset() {
        this.submitted = false;
        this.ealxs = [];
        this.itemsPrecos = [];
        this.submitted = false;
    }
    iniciaObjs(): void {
        this.fetchEstoqueAlmoxarifado();
    }
    initDefaults(): void {
        this.statusForm = 1;
        this.submitted = false;
        this.flgPesquisandoCliente = 0;
    }

    updateFilter(event: any) {
        const val = event.target.value.toLowerCase();

        let temp = null;

        if (val === 'x') {
            temp = this.itemsPrecos!.filter(function (d) {
                return d.acaoTransf === true;
            });
        } else if (val === 'dif') {
            temp = this.itemsPrecos!.filter(function (d) {
                return d.pvenda !== null && d.pvenda > 0 && ((d.vlr - d.pvenda) > 0.01 || (d.vlr - d.pvenda) < -0.01);
            });
        } else {
            // filter our data
            temp = this.itemsPrecos!.filter(function (d) {
                return d.itemNome.toLowerCase().indexOf(val) !== -1 || !val;
            });
        }



        // update the rows
        this.itemsPrecosFiltered = [...temp];
        // Whenever the filter changes, always go back to the first page
        this.table.offset = 0;
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

    onLimpa(): void {
        this.onReset();
        this.iniciaObjs();
        this.pop('success', 'Limpo com sucesso', '');
        this.buscaForm.reset();
        this.cdr.detectChanges();
    }

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }



    msgAlerta(titulo: string, conteudo: string, tipo: string): void {
        const activeModal = this._modalService.open(
            AppTituloModalAlertComponent, { backdrop: true });
        activeModal.componentInstance.modalHeader = titulo;
        activeModal.componentInstance.modalContent = conteudo;
        activeModal.componentInstance.modalType = tipo;
        activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
    }
}
