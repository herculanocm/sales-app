import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-venda-modal-confirm-just',
    templateUrl: './app-venda-modal-confirm-just.component.html',
    styleUrls: ['./app-venda-modal-confirm-just.component.scss'],
})
export class AppVendaModalConfirmJustComponent {
    @Input() modalHeader: string;
    @Input() modalContent: string;
    @Input() modalType: string;
    @Input() confirmLabel: string;
    @Input() defaultLabel: string;
    @Input() tipoStatus!: string;

    constructor(public activeModal: NgbActiveModal) {
        this.modalHeader = 'Header';
        this.modalContent = 'Content';
        this.modalType = 'alert';
        this.confirmLabel = 'Sim';
        this.defaultLabel = 'Ok';
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
    }

    isNotConfirm(): boolean {
        if (this.tipoStatus == null || this.tipoStatus !== 'confirmação') {
            return true;
        } else {
            return false;
        }
    }

    justificativa(justificativa: any): void {
        this.activeModal.close({tipo: 'confirm', justificativa: justificativa});
    }
    fechar(): void {
        this.activeModal.close();
    }
}
