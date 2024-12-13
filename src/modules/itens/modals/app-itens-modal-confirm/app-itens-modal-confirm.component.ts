import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-itens-modal-confirm',
    templateUrl: './app-itens-modal-confirm.component.html',
    styleUrls: ['./app-itens-modal-confirm.component.scss'],
})
export class AppItensModalConfirmComponent {
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
