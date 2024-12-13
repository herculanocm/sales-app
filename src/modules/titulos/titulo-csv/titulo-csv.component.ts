import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr'
import { NgxCSVParserError, NgxCsvParser } from 'ngx-csv-parser';
import { ngxCsv } from 'ngx-csv';
import moment from 'moment';
import 'moment/locale/pt-br';
import { BanckingTitNossoNumeroAux, TituloCSVImportAux } from '@modules/shared/models/titulo';
import { TitulosService } from '@modules/shared/services';
import { NgbdModalConfirmAuxComponent, NgbdModalMessageAuxComponent } from '../titulos.utils';

@Component({
    selector: 'app-titulo-csv',
    templateUrl: './titulo-csv.component.html',
    styleUrls: ['./titulo-csv.component.scss'],
})
export class TituloCsvComponent {

    ColumnMode = ColumnMode;
    submitted: boolean;
    statusForm: number;
    botaoGeraCSV!: string;
    currentUserSalesApp: any = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);
    selected: any[] = [];
    @ViewChild('fileImportInput', { static: false }) fileImportInput: any;
    selectionTypeSingle = SelectionType.single;

    csvRecords: TituloCSVImportAux[] = [];
    header = false;

    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _modalService: NgbModal,
        private spinner: NgxSpinnerService,
        private _tituloService: TitulosService,
        private ngxCsvParser: NgxCsvParser
    ) {
        this.submitted = false;
        this.statusForm = 1;
    }

    getRowClass(row: TituloCSVImportAux) {
        return {
            'classe-fechado': row.indStatusSales === 'F' && row.flpago === 1,
            'classe-alerta': row.indStatusSales === 'A' && row.flpago === 0,
            'classe-falta-fechar': ((typeof (row.numtransvendaWinthor) != 'undefined' && row.numtransvendaWinthor != null && row.numtransvendaWinthor > 0) && (typeof (row.indStatusSales) == 'undefined' || row.indStatusSales == null || row.indStatusSales === 'A' || row.flpago === 0)),
        };
    }

    isDisableRow(row: TituloCSVImportAux): boolean {
        if (typeof (row.numtransvendaWinthor) != 'undefined' && row.numtransvendaWinthor != null && row.numtransvendaWinthor > 0) {
            return false;
        } else {
            return true;
        }
    }

    onBaixarSelecionados(): void {
        const titBaixarFlt = this.csvRecords.filter(cr => {
            return cr.indBaixar == true;
        });
        if (titBaixarFlt.length > 0) {

            const activeModal = this._modalService.open(NgbdModalConfirmAuxComponent, { ariaLabelledBy: 'modal-basic-title' });
            activeModal.componentInstance.message = 'Deseja realmente baixar os selecionados?';
            activeModal.result.then(
                (result) => {
                    if (result === 'confirm') {


                        this.spinner.show('fullSpinner');
                        this._tituloService.baixaTitulosSalesByCSV(titBaixarFlt)
                            .subscribe({
                                next: (data) => {
                                    this.spinner.hide('fullSpinner');

                                    if (data.statusCode === 0) {
                                        this.clearSelectIndBaixar();

                                        const activeModal = this._modalService.open(NgbdModalMessageAuxComponent, { ariaLabelledBy: 'modal-basic-title' });
                                        activeModal.componentInstance.htmlBody = data.htmlBody;
                                        activeModal.componentInstance.header = 'Retorno do Servidor';

                                        this.limparFile();
                                        this.cdr.markForCheck();

                                    } else {
                                        this.toastr.warning('Erro ao relalizar procedimento, contate o administrador', 'ATENÇÃO');
                                        this.cdr.markForCheck();
                                    }

                                },
                                error: (err) => {
                                    this.spinner.hide('fullSpinner');
                                    console.log(err);
                                    this.toastr.error('Erro ao baixar titulos, contate o administrador', 'ERRO');
                                    this.cdr.markForCheck();
                                }
                            });

                    }
                }
            );
        } else {
            this.toastr.warning('Nenhum titulo marcado para baixar', 'ATENÇÃO');
        }
    }

    clearSelectIndBaixar(): void {
        this.csvRecords.forEach(cr => {
            cr.indBaixar = false;
        });
    }

    onBuscaTituloSalesWinthor(): void {
        const nossoNumeros: number[] = this.getNossoNumerosFromCsvRecords();
        const bOjb: BanckingTitNossoNumeroAux = {
            lst: nossoNumeros
        };

        this.spinner.show('fullSpinner');
        this._tituloService.getTitulosSalesWinthor(bOjb)
            .subscribe({
                next: (data) => {
                    this.spinner.hide('fullSpinner');
                    data.forEach(dt => {
                        this.csvRecords.forEach(cr => {
                            if (dt.nossoNumeroCsv === cr.nossoNumeroPlan && dt.winthorTitAuxIn != null) {
                                cr.nossonumbcoWinthor = dt.winthorTitAuxIn.nossonumbco;
                                cr.numpedWinthor = dt.winthorTitAuxIn.numped;
                                cr.numtransvendaWinthor = dt.winthorTitAuxIn.numtransvenda;
                                cr.flpago = dt.winthorTitAuxIn.flpago;
                                cr.prest = dt.winthorTitAuxIn.prest;

                                if (dt.vendaTituloV1Aux != null) {
                                    cr.vendaIdSales = dt.vendaTituloV1Aux.venda_id;
                                    cr.tituloIdSales = dt.vendaTituloV1Aux.titulo_id;
                                    cr.dtaVencimentoSales = dt.vendaTituloV1Aux.dta_vencimento;
                                    cr.indStatusSales = dt.vendaTituloV1Aux.ind_status;
                                    cr.vlrTotalSales = dt.vendaTituloV1Aux.vlr_total;
                                    cr.indStatusCompletoSales = this.getStatusCompleto(dt.vendaTituloV1Aux.ind_status);
                                }
                            }
                        });
                    });

                    this.csvRecords = [...this.csvRecords];
                    this.toastr.success('Busca realizada com sucesso', 'OK');
                    //console.log(this.csvRecords);
                    this.cdr.markForCheck();
                },
                error: (err) => {
                    this.spinner.hide('fullSpinner');
                    console.log(err);
                    this.toastr.error('Erro ao buscar titulos', 'ERRO');
                    this.cdr.markForCheck();
                }
            });
    }

    getNossoNumerosFromCsvRecords(): number[] {
        const nossoNumeros: number[] = [];
        this.csvRecords.forEach(cr => {
            nossoNumeros.push(cr.nossoNumeroPlan);
        });
        return nossoNumeros;
    }

    onSelecionaTodos(): void {
        this.csvRecords.forEach(cr => {
            if (!this.isDisableRow(cr)) {
                cr.indBaixar = true;
            }
        });

        const flt = this.csvRecords.filter(cr => {
            return cr.indBaixar == true;
        });

        const message = flt.length + " titulos selecionados";
        this.toastr.success(message, 'OK');
    }

    limparFile(): void {
        this.fileImportInput.nativeElement.value = '';
        this.csvRecords = [];
    }

    fileChangeListener($event: any): void {

        // Select the files from the event
        const files = $event.srcElement.files;



        this.ngxCsvParser.parse(files[0], { header: this.header, delimiter: ';' })
            .pipe().subscribe((result: any[] | NgxCSVParserError) => {

                const result2 = result as any[];
                let i = 1;
                result2.forEach((rs: any[]) => {
                    //console.log(rs);
                    const obj: TituloCSVImportAux = {
                        rowNum: i,
                        pagadorPlan: (rs[0] as string).trim(),
                        seuNumeroPlan: (rs[1] as string).trim(),
                        nossoNumeroPlan: Number((rs[2] as string).trim()),
                        dataVencimentoPlan: this.parseDateFromString(rs[3]),
                        valorTituloPlan: Number(((rs[4] as string).trim().replace('.', '')).replace(',', '.')),
                        valorTituloPgtoPlan: Number(((rs[5] as string).trim().replace('.', '')).replace(',', '.')),
                        dataPagamentoPlan: this.parseDateFromString(rs[6])
                    };
                    this.csvRecords.push(obj);
                    i++;
                });
                this.csvRecords = [...this.csvRecords];
                this.cdr.markForCheck();
                //console.log(this.csvRecords);
            }, (error: NgxCSVParserError) => {
                this.csvRecords = [];
                this.cdr.markForCheck();
                console.log('Error', error);
            });

    }

    getStatusCompleto(sigla: string): string {
        if (sigla === 'A') {
            return 'ABERTO';
        } else if (sigla === 'F') {
            return 'FECHADO';
        } else if (sigla === 'N') {
            return 'NEGOCIADO';
        } else if (sigla === 'P') {
            return 'EM PROTESTO';
        } else {
            return 'UNKNOWN';
        }
    }
    deleteRow(row: any): void {
        const rowNum: number = row.rowNum;
        for (let i = 0; i < this.csvRecords.length; i++) {
            if (rowNum === this.csvRecords[i].rowNum) {
                this.csvRecords.splice(i, 1);
            }
        }
        this.csvRecords = [...this.csvRecords];
        this.cdr.markForCheck();
    }

    parseDateFromString(dateString: string): Date | null {
        const dateParts = dateString.split('/');
        if (dateParts.length === 3) {
            const day = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10) - 1; // Month is zero-based (0 = January, 1 = February, etc.)
            const year = parseInt(dateParts[2], 10);

            if (this.isValidDate(day, month, year)) {
                return new Date(year, month, day);
            }
        }
        return null;
    }

    isValidDate(day: number, month: number, year: number): boolean {
        // Check if the month is valid (0-11), the day is valid, and the year is within a reasonable range
        return month >= 0 && month <= 11 && day >= 1 && day <= 31 && year >= 1000 && year <= 9999;
    }

    geraCSV(): void {


        const dtaAtualUser = moment().format('YYYY_MM_DD_HH_mm_ss');
        const nameReport = 'titulo_csv_' + this.currentUserSalesApp.username + '_' + dtaAtualUser;

        const options = {
            fieldSeparator: ';',
            quoteStrings: '"',
            decimalseparator: ',',
            showLabels: true,
            showTitle: false,
            useBom: true,
            noDownload: false,
            headers: [
                'linha',
                'ind_baixar',
                'baixado_sales',
                'baixado_winthor',
                'pagador',
                'seu_numero_plan',
                'nosso_numero_plan',
                'dta_venc_plan',
                'valor_plan',
                'valor_pgto_plan',
                'dta_pgto_plan',

                'nosso_num_bco_winthor',
                'nosso_ped_winthor',
                'num_trans_venda_winthor',

                'venda_id_sales',
                'titulo_id_sales',
                'ind_status_sales',
                'dta_venci_sales',
                'vlr_total_sales'
            ],
        };
        const data: any[] = [];

        this.csvRecords.forEach((t: TituloCSVImportAux) => {
            const obj = {
                rowNum: t.rowNum,
                indBaixar: typeof (t.indBaixar) == 'undefined' || t.indBaixar == null || t.indBaixar == false ? 'NAO' : 'SIM',
                baixadoSales: typeof (t.indStatusSales) != 'undefined' && t.indStatusSales != null && t.indStatusSales == 'F' ? 'SIM' : 'NAO',
                baixadoWinthor: typeof (t.flpago) != 'undefined' && t.flpago != null && t.flpago === 1 ? 'SIM' : 'NAO',
                pagadorPlan: typeof (t.pagadorPlan) == 'undefined' || t.pagadorPlan == null ? null : t.pagadorPlan,
                seuNumeroPlan: typeof (t.seuNumeroPlan) == 'undefined' || t.seuNumeroPlan == null ? null : t.seuNumeroPlan,
                nossoNumeroPlan: typeof (t.nossoNumeroPlan) == 'undefined' || t.nossoNumeroPlan == null ? null : t.nossoNumeroPlan,
                dataVencimentoPlan: typeof (t.dataVencimentoPlan) == 'undefined' || t.dataVencimentoPlan == null ? null : moment(t.dataVencimentoPlan).format("DD/MM/YYYY"),
                valorTituloPlan: typeof (t.valorTituloPlan) == 'undefined' || t.valorTituloPlan == null ? null : t.valorTituloPlan,
                valorTituloPgtoPlan: typeof (t.valorTituloPgtoPlan) == 'undefined' || t.valorTituloPgtoPlan == null ? null : t.valorTituloPgtoPlan,
                dataPagamentoPlan: typeof (t.dataPagamentoPlan) == 'undefined' || t.dataPagamentoPlan == null ? null : moment(t.dataPagamentoPlan).format("DD/MM/YYYY"),

                nossonumbcoWinthor: typeof (t.nossonumbcoWinthor) == 'undefined' || t.nossonumbcoWinthor == null ? null : t.nossonumbcoWinthor,
                numpedWinthor: typeof (t.numpedWinthor) == 'undefined' || t.numpedWinthor == null ? null : t.numpedWinthor,
                numtransvendaWinthor: typeof (t.numtransvendaWinthor) == 'undefined' || t.numtransvendaWinthor == null ? null : t.numtransvendaWinthor,

                vendaIdSales: typeof (t.vendaIdSales) == 'undefined' || t.vendaIdSales == null ? null : t.vendaIdSales,
                tituloIdSales: typeof (t.tituloIdSales) == 'undefined' || t.tituloIdSales == null ? null : t.tituloIdSales,
                // indStatusSales: typeof (t.indStatusSales) == 'undefined' || t.indStatusSales == null ? null : t.indStatusSales,
                indStatusCompletoSales: typeof (t.indStatusCompletoSales) == 'undefined' || t.indStatusCompletoSales == null ? null : t.indStatusCompletoSales,
                dtaVencimentoSales: typeof (t.dtaVencimentoSales) == 'undefined' || t.dtaVencimentoSales == null ? null : moment(t.dtaVencimentoSales).format("DD/MM/YYYY"),
                vlrTotalSales: typeof (t.vlrTotalSales) == 'undefined' || t.vlrTotalSales == null ? null : t.vlrTotalSales
            };
            data.push(obj);
        });

        const csv = new ngxCsv(data, nameReport, options);
        this.cdr.detectChanges();


    }
}
// .subscribe({
//     next: (data) => {},
//     error: (err) => {}
// });