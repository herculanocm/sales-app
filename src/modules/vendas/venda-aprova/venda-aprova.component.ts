import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AppVendaModalAlertComponent } from '../modals/app-venda-modal-alert/app-venda-modal-alert.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppVendaModalConfirmJustComponent } from '../modals/app-venda-modal-confirm-just/app-venda-modal-confirm-just.component';
import { ToastrService } from 'ngx-toastr';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { VendaDTO } from '@modules/shared/models/venda';
import { CurrentUserSalesAppAux, RequestServerJust } from '@modules/shared/models/generic';
import { VendaService } from '@modules/shared/services';

@Component({
    selector: 'app-venda-aprovar',
    templateUrl: './venda-aprova.component.html',
    styleUrls: ['./venda-aprova.component.scss'],
})
export class VendaAprovaComponent implements OnInit {

    ColumnMode!: ColumnMode;
    submitted: boolean;
    statusForm!: number;
    vendas: VendaDTO[];
    currentUserSalesApp!: CurrentUserSalesAppAux;

    constructor(
        private _vendaService: VendaService,
        private _modalService: NgbModal,
        private spinner: NgxSpinnerService,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
    ) {
        this.submitted = false;
        this.vendas = [];
    }
    ngOnInit(): void {
        this.currentUserSalesApp = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);
        this.getVendas();
        this.cdr.detectChanges();
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

    getVendas(): void {
        this.spinner.show();
        this._vendaService.getVendasAprovacaoSuperior()
        .subscribe((data) => {
            this.spinner.hide();
            this.vendas = data;
            // console.log(this.getAlertas(this.vendas[0].vendaStatusAtualDTO.descricao));
            this.cdr.detectChanges();
        }, (error) => {
            this.spinner.hide();
            this.pop('error', 'Erro', 'Erro ao buscar as vendas, contate o administrador');
            this.cdr.detectChanges();
        });
    }

    getAlertas(alertas: string): string[] {
        const al = alertas.split('|');
        return al.filter(alt => alt.trim().length > 0);
    }

    aprovaVenda(vendaId: number): void {
        const activeModal = this._modalService.open(AppVendaModalConfirmJustComponent);
        activeModal.componentInstance.modalHeader = 'Confirme';
        activeModal.componentInstance.modalContent = 'Deseja realmente aprovar o Pedido ?';
        activeModal.componentInstance.modalType = 'confirm';
        activeModal.componentInstance.defaultLabel = 'Não';
        activeModal.result.then((result) => {

            if (typeof (result) !== 'undefined' && result != null && result.tipo === 'confirm') {
                this.spinner.show();

                const r = new RequestServerJust();
                r.idPedido = vendaId;
                r.justificativa = result.justificativa;

                this._vendaService.postAprovaVenda(r)
                    .subscribe((data) => {
                        this.spinner.hide();
                        // this.pop('success', 'Ok','');
                        this.removeVendas(vendaId);
                    }, (error) => {
                        this.spinner.hide();
                    });

            }
        }, (error) => { console.log(error) });
    }

    desconfirmarVenda(vendaId: number): void {

        const activeModal = this._modalService.open(AppVendaModalConfirmJustComponent);
        activeModal.componentInstance.modalHeader = 'Confirme';
        activeModal.componentInstance.modalContent = 'Deseja realmente desconfirmar o Pedido? Após essa ação o pedido irá para o status aberto';
        activeModal.componentInstance.modalType = 'confirm';
        activeModal.componentInstance.defaultLabel = 'Não';
        activeModal.result.then((result) => {
            if (typeof (result) !== 'undefined' && result != null && result.tipo === 'confirm') {
                this.spinner.show('fullSpinner');

                const r = new RequestServerJust();
                r.idPedido = vendaId;
                r.justificativa = result.justificativa;

                this._vendaService.postDesconfirmarVenda(r)
                    .subscribe((data) => {

                        this.spinner.hide();
                        // this.pop('success', 'Ok','');
                        this.removeVendas(vendaId);

                    }, (error) => {
                        this.spinner.hide();
                    });

            }
        }, (error) => { console.log(error) });
    }


    removeVendas(id: number): void {
        for (let i = 0; i < this.vendas.length; i ++ ) {
            if (id === this.vendas[i].id) {
                this.vendas.splice(i, 1);
                i = this.vendas.length + 1;
            }
        }
    }

    convertDate(inputFormat: any, dia: any) {
        function pad(s: any) {
            return (s < 10) ? '0' + s : s;
        }
        const d = new Date(inputFormat);
        return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate() + dia)].join('-');
    }

    msgAlerta(titulo: string, conteudo: string, tipo: string): void {
        const activeModal = this._modalService.open(
            AppVendaModalAlertComponent, { backdrop: true });
        activeModal.componentInstance.modalHeader = titulo;
        activeModal.componentInstance.modalContent = conteudo;
        activeModal.componentInstance.modalType = tipo;
        activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
    }
}
