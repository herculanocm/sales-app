import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-consulta-modal-confirm',
    templateUrl: './app-consulta-modal-confirm.component.html',
    styleUrls: ['./app-consulta-modal-confirm.component.scss'],
})
export class AppConsultaModalConfirmComponent {
    @Input() modalHeader: string;
    @Input() modalContent: string;
    @Input() modalType: string;
    @Input() img?: any;
    @Input() confirmLabel: string;
    @Input() defaultLabel: string;

    constructor(public activeModal: NgbActiveModal) {
        this.modalHeader = 'Header';
        this.modalContent = 'Content';
        this.modalType = 'alert';
        this.confirmLabel = 'Sim';
        this.defaultLabel = 'Ok';
    }
}
