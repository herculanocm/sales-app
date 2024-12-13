import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BancoFebrabanDTO } from '../../configuracoes/banco-febraban';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { AppTituloModalAlertComponent } from '../modals/app-titulo-modal-alert/app-titulo-modal-alert.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import 'moment/locale/pt-br';
import moment from 'moment';
import 'moment/locale/pt-br';
import { ngxCsv } from 'ngx-csv';
import { TotvsService } from '../totvs.service';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserSalesAppAux } from '@app/app.utils';
import { ItemPcProdut } from '@modules/shared/models/totvs';
import { TituloTipoDTO } from '@modules/shared/models/titulo';

@Component({
    selector: 'app-totvs-item',
    templateUrl: './totvs-item.component.html',
    styleUrls: ['./totvs-item.component.scss'],
})
export class TotvsItemComponent implements OnInit {

    ColumnMode: any;
    submitted: boolean;
    statusForm: number;
    selectionTypeSingle = SelectionType.single;
    selected: any[] = [];

    itemPcProduts: ItemPcProdut[] | undefined = [];
    rows: ItemPcProdut[] = [];

    bancoFebrabans!: BancoFebrabanDTO[];
    tituloTipos!: TituloTipoDTO[];

    currentUserSalesApp!: CurrentUserSalesAppAux;

    flgPesquisandoCliente!: number;
    flgPesquisandoEmissor!: number;

    @ViewChild(DatatableComponent) table!: DatatableComponent;

    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private spinner: NgxSpinnerService,
        private _modalService: NgbModal,
        private _service: TotvsService,
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

    onReset() {
        this.submitted = false;
    }
    async iniciaObjs(): Promise<void> {
        this.initDefaults();
        this.spinner.show('fullSpinner');
        this.itemPcProduts = await this._service.getItemPcProdut().toPromise();
        // console.log(this.itemPcProduts);
        this.itemPcProduts = this.itemPcProduts!.sort((c1, c2) => {
            if (c1.id > c2.id) {
                return 1;
            }
            if (c1.id < c2.id) {
                return -1;
            }
            return 0;
        });
        this.rows = [...this.itemPcProduts];
        this.spinner.hide('fullSpinner');
        this.cdr.detectChanges();
    }
    initDefaults(): void {
        this.statusForm = 1;
        this.submitted = false;
        this.flgPesquisandoCliente = 0;
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
    }

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateItens(): void {
        this.spinner.show('fullSpinner');
        this._service.updateItens()
            .subscribe({
                next: (data) => {
                    this.spinner.hide('fullSpinner');
                    // console.log(data);
                    if (data.status) {
                        this.itemPcProduts = [...data.lista];
                        this.rows = [...this.itemPcProduts];
                        this.msgAlerta('Retorno', data.msg, 'success');
                    } else {
                        this.msgAlerta('Retorno', data.msg, 'error');
                    }
                    this.cdr.detectChanges();
                },
                error: (error) => {
                    this.spinner.hide('fullSpinner');
                    console.log(error);
                    this.msgAlerta('ERROR', 'Contate o administrador', 'error');
                    this.cdr.detectChanges();
                }
            });
    }

    updateFilter(event: any) {
        const val = event.target.value.toLowerCase();

        // filter our data
        const temp = this.itemPcProduts!.filter(function (d) {
            return d.nome.toLowerCase().indexOf(val) !== -1 || !val;
        });

        // update the rows
        this.rows = temp;
        // Whenever the filter changes, always go back to the first page
        this.table.offset = 0;
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
                'COD_BARRAS_SALES',
                'CODPROD_TOTVS',
                'DESCRICAO_TOTVS',
                'COD_BARRAS_TOTVS',
                'EMBALAGEM_TOTVS',
                'UNIDADE_TOTVS',
                'QTUNIT_TOTVS',
                'QTUNITCX_TOTVS',
                'DTCADASTRO_TOTVS'
            ],
        };
        const data: any[] = [];

        this.itemPcProduts!.forEach((ic: ItemPcProdut) => {
            const obj = {
                ID_SALES: ic.id,
                ID_AUX: ic.idAux,
                NOME_SALES: ic.nome,
                COD_BARRAS_SALES: ic.codigoBarras,
                CODPROD_TOTVS: ic.codProd,
                DESCRICAO_TOTVS: ic.descricao,
                COD_BARRAS_TOTVS: ic.codBarrasTotvs,
                EMBALAGEM_TOTVS: ic.embalagem,
                UNIDADE_TOTVS: ic.unidade,
                QTUNIT_TOTVS: ic.qtunit,
                QTUNITCX_TOTVS: ic.qtUnitcx,
                DTCADASTRO_TOTVS: ic.dtCadastro
            };
            data.push(obj);
        });

        const csv = new ngxCsv(data, nameReport, options);
    }
}
