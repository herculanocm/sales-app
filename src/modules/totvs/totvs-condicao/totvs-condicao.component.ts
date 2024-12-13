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
import { CondicaoPcplgpag } from '@modules/shared/models/totvs';
import { TituloTipoDTO } from '@modules/shared/models/titulo';


@Component({
    selector: 'app-totvs-condicao',
    templateUrl: './totvs-condicao.component.html',
    styleUrls: ['./totvs-condicao.component.scss'],
})
export class TotvsCondicaoComponent implements OnInit {

    ColumnMode: any;
    submitted: boolean;
    statusForm: number;

    selected: any[] = [];
    selectionTypeSingle = SelectionType.single;
    condicaoPcplgpags: CondicaoPcplgpag[] | undefined = [];
    rows: CondicaoPcplgpag[] = [];

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
        this.cdr.detectChanges();
    }

    onReset() {
        this.submitted = false;
    }
    async iniciaObjs(): Promise<void> {
        this.initDefaults();
        this.spinner.show('fullSpinner');
        this.condicaoPcplgpags = await this._service.getCondicaoPcplgpag().toPromise();
        this.condicaoPcplgpags = this.condicaoPcplgpags!.sort((c1, c2) => {
            if (c1.id > c2.id) {
                return 1;
            }
            if (c1.id < c2.id) {
                return -1;
            }
            return 0;
        });
        this.rows = [...this.condicaoPcplgpags];
        this.spinner.hide('fullSpinner');
        this.cdr.detectChanges();
    }
    initDefaults(): void {
        this.statusForm = 1;
        this.submitted = false;
        this.flgPesquisandoCliente = 0;
    }

    async onLimpa(): Promise<void> {
        this.onReset();
        await this.iniciaObjs();
        this.pop('success', 'Limpo com sucesso', '');
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

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateCondicoes(): void {
        this.spinner.show('fullSpinner');
        this._service.updateCondicoes()
            .subscribe({
                next: (data) => {
                    this.spinner.hide('fullSpinner');
                    console.log(data);
                    if (data.status) {
                        this.condicaoPcplgpags = [...data.lista];
                        this.rows = [...this.condicaoPcplgpags];
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
        const temp = this.condicaoPcplgpags!.filter(function (d) {
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
        const nameReport = 'condicoes_sales_totvs_' + this.currentUserSalesApp.username + '_' + dtaAtualUser;

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
                'TIPO_PAGAMENTO_SALES',
                'GERA_TITULO_SALES',
                'TIPO_TITULO_SALES',
                'CODPLPAG_TOTVS',
                'DESCRICAO_TOTVS',
                'NUMDIAS_TOTVS',
                'TIPOPRAZO_TOTVS',
                'TIPOVENDA_TOTVS'
            ],
        };
        const data: any[] = [];

        this.condicaoPcplgpags!.forEach((i: CondicaoPcplgpag) => {
            const obj = {
                ID_SALES: i.id,
                ID_AUX: i.idAux,
                NOME_SALES: i.nome,
                TIPO_PAGAMENTO_SALES: i.indTipoPagamento,
                GERA_TITULO_SALES: i.geraTitulo,
                TIPO_TITULO_SALES: i.tipoTitulo,
                CODPLPAG_TOTVS: i.codplpag,
                DESCRICAO_TOTVS: i.descricao,
                NUMDIAS_TOTVS: i.numdias,
                TIPOPRAZO_TOTVS: i.tipoprazo,
                TIPOVENDA_TOTVS: i.tipovenda
            };
            data.push(obj);
        });



        const csv = new ngxCsv(data, nameReport, options);

    }
}
