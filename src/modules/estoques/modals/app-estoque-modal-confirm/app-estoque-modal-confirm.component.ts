import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-estoque-modal-confirm',
    templateUrl: './app-estoque-modal-confirm.component.html',
    styleUrls: ['./app-estoque-modal-confirm.component.scss'],
})
export class AppEstoqueModalConfirmComponent {
    @Input() modalHeader: string;
    @Input() modalContent: string;
    @Input() modalType: string;
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
