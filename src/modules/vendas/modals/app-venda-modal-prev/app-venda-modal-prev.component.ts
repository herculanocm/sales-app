import { Component, Input } from '@angular/core';
import { VendaStatusAux } from '@modules/shared/models/romaneio';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-venda-modal-alert-prev',
    templateUrl: './app-venda-modal-prev.component.html',
    styleUrls: ['./app-venda-modal-prev.component.scss'],
})
export class AppVendaModalAlertPreVendaComponent {
    @Input() modalHeader: string;
    @Input() modalContent: string;
    @Input() modalType: string;
    @Input() vendaStatusAuxs!: VendaStatusAux[];


    constructor(public activeModal: NgbActiveModal) {
        this.modalHeader = 'Header';
        this.modalContent = 'Content';
        this.modalType = 'alert';
    }
}
