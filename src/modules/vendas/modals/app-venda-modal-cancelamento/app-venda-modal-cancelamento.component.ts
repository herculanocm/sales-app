import { Component, Input } from '@angular/core';
import { VendaStatusMotivoDTO } from '@modules/shared/models/venda';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';


@Component({
    selector: 'app-venda-modal-cancelamento',
    templateUrl: './app-venda-modal-cancelamento.component.html',
    styleUrls: ['./app-venda-modal-cancelamento.component.scss'],
})
export class AppVendaModalCancelamentoComponent {
    @Input() modalHeader: string;
    @Input() modalContent: string;
    @Input() modalType: string;
    @Input() confirmLabel: string;
    @Input() defaultLabel: string;
    @Input() tipoStatus!: string;
    @Input() motivosCancelamento: VendaStatusMotivoDTO[];

    motivoCancelamento: VendaStatusMotivoDTO | null;

    constructor(public activeModal: NgbActiveModal, private toastr: ToastrService) {
        this.modalHeader = 'Header';
        this.modalContent = 'Content';
        this.modalType = 'alert';
        this.confirmLabel = 'Sim';
        this.defaultLabel = 'Ok';
        this.motivosCancelamento = [];
        this.motivoCancelamento = null;
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


    isNotConfirm(): boolean {
        if (this.tipoStatus == null || this.tipoStatus !== 'confirmação') {
            return true;
        } else {
            return false;
        }
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
    }

    justificativa(justificativa: string, motivo: any): void {
        console.log(motivo);
        console.log(justificativa);
        if (motivo == null) {
            this.pop('error', 'Erro', 'Selecione o motivo para confirmar');
        } else {
            this.activeModal.close({tipo: 'confirm', justificativa: justificativa, motivo: motivo});
        }
        // this.activeModal.close({tipo: 'confirm', justificativa: justificativa, motivo: motivo});
    }
    fechar(): void {
        this.activeModal.close();
    }
}
