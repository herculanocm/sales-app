import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-consulta-modal-alert',
    templateUrl: './app-consulta-modal-alert.component.html',
    styleUrls: ['./app-consulta-modal-alert.component.scss'],
})
export class AppConsultaModalAlertComponent {
    @Input() modalHeader: string;
    @Input() modalContent: string;
    @Input() modalType: string;


    constructor(public activeModal: NgbActiveModal) {
        this.modalHeader = 'Header';
        this.modalContent = 'Content';
        this.modalType = 'alert';
    }
}
