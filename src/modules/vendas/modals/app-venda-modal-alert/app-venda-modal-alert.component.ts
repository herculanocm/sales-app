import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-venda-modal-alert',
    templateUrl: './app-venda-modal-alert.component.html',
    styleUrls: ['./app-venda-modal-alert.component.scss'],
})
export class AppVendaModalAlertComponent {
    @Input() modalHeader: string;
    @Input() modalContent: string;
    @Input() modalType: string;


    constructor(public activeModal: NgbActiveModal) {
        this.modalHeader = 'Header';
        this.modalContent = 'Content';
        this.modalType = 'alert';
    }
}
