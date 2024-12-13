import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import moment from 'moment';
import 'moment/locale/pt-br';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ClienteDTO } from '@modules/shared/models/cliente';
import { TituloReceberDTO } from '@modules/shared/models/titulo';
import { CurrentUserSalesAppAux } from '@modules/shared/models/generic';
import { VendaService } from '@modules/shared/services';
import { VendaDTO } from '@modules/shared/models/venda';

@Component({
    selector: 'app-venda-modal-titulos',
    templateUrl: './app-venda-modal-titulos.component.html',
    styleUrls: ['./app-venda-modal-titulos.component.scss'],
})
export class AppVendaModalTitulosComponent implements OnInit {
    @Input() clienteDTO!: ClienteDTO;

    flgPesquisando: number;
    flgPesqVenda: number;
    activeNavTit: number;
    titulosAbertos: TituloReceberDTO[];
    titulosFechados: TituloReceberDTO[];
    titulosNegociados: TituloReceberDTO[];
    titulosProtesto: TituloReceberDTO[];
    currentUserSalesApp!: CurrentUserSalesAppAux;
    ColumnMode = ColumnMode;

    constructor(
        public activeModal: NgbActiveModal,
        private toastr: ToastrService,
        private spinner: NgxSpinnerService,
        private _vendaService: VendaService,
        private router: Router,
    ) {
        this.flgPesquisando = 0;
        this.flgPesqVenda = 0;
        this.activeNavTit = 1;
        this.titulosAbertos = [];
        this.titulosFechados = [];
        this.titulosNegociados = [];
        this.titulosProtesto = [];
    }

    getRowClass(row: any) {
        return {
            'table-atraso': row.diasLiquidacaoVencimento > 0
        };
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
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

    daysFromLiquiVencimento(dtaVencimento: Date, dtaLiquidacao: Date): number {
        let days = 0;

        if (dtaLiquidacao == null) {
            dtaLiquidacao = new Date();
        }
        const mDtaVencimento = moment(dtaVencimento, 'YYYY-MM-DD');
        const mDtaLiquidacao = moment(dtaLiquidacao, 'YYYY-MM-DD');
        // console.log(mDtaVencimento.diff(mDtaEmissao, 'days'));
        days = mDtaLiquidacao.diff(mDtaVencimento, 'days');

        if (days < 0) {
            days = 0;
        }

        return days;
    }

    ngOnInit(): void {
        // console.log(this.clienteDTO);
        this.currentUserSalesApp = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);

        this.spinner.show();
        this._vendaService.buscaTitulosPorIdCliente(this.clienteDTO.id)
            .subscribe((data) => {
                this.spinner.hide();

                data.forEach((tit: any) => {
                    tit.diasLiquidacaoVencimento = this.daysFromLiquiVencimento(tit.dtaVencimento, tit.dtaLiquidacao);
                });

                data.sort((d1: any, d2: any) => {
                    if (d1.id > d2.id) {
                        return -1;
                    }
                    if (d1.id < d2.id) {
                        return 1;
                    }
                    return 0;
                });
                this.titulosAbertos = data.filter((ta: any) => {
                    return ta.indStatus === 'A';
                });

                this.titulosFechados = data.filter((ta: any) => {
                    return ta.indStatus === 'F';
                });

                this.titulosNegociados = data.filter((ta: any) => {
                    return ta.indStatus === 'N';
                });

                this.titulosProtesto = data.filter((ta: any) => {
                    return ta.indStatus === 'P';
                });

            }, (error) => {
                this.spinner.hide();
                this.pop('error', 'Atenção', 'Erro ao buscar os titulos vinculados ao cliente');
            });
    }

    imprimeVenda(tit: TituloReceberDTO): void {
        if (tit.vendaDTO_id != null && tit.vendaDTO_id > 0) {
            this.flgPesqVenda = 1;
            this._vendaService.findById(tit.vendaDTO_id)
                .subscribe((data) => {
                    this.flgPesqVenda = 0;
                    this.openPrintPage(data);
                }, (error) => {
                    this.flgPesqVenda = 0;
                    this.pop('error', 'Erro ao buscar a pre-venda', '');
                });
        } else {
            this.flgPesqVenda = 0;
            this.pop('error', 'Só é possivel imprimir titulos gerados por pre-venda', '');
        }
    }

    openPrintPage(vendaDTO: VendaDTO): void {

        vendaDTO.statusConfirmacao = this._vendaService.getUltStatusConfirmacao(vendaDTO);
        vendaDTO.statusAprovacao = this._vendaService.getUltStatusAprovado(vendaDTO);
        vendaDTO.statusFaturamento = this._vendaService.getUltStatusFaturado(vendaDTO);


        const id = new Date().getTime();
        const key = (this.currentUserSalesApp.username + '_' + id.toString() + '_' + vendaDTO.id);

        this._vendaService.storageSet(key, { id: 'venda', data: vendaDTO })
            .subscribe((resp) => {
                console.log(resp);
                console.log('Deu tudo certo, vamos imprimir');
                const hrefFull = this._vendaService.hrefContext() + 'print/venda/' + key;
                // console.log(hrefFull);
                this.router.navigate([]).then(result => {
                    window.open(hrefFull, '_blank');
                });
            }, (error) => {
                console.log(error);
                this.pop('error', 'Erro ao tentar imprimir, contate o administrador', '');
                console.log('Erro ao tentar imprimir, contate o administrador, não salvou no indexdDB');
            });
    }
}
