import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-titulo-modal-alert',
    templateUrl: './app-titulo-modal-alert.component.html',
    styleUrls: ['./app-titulo-modal-alert.component.scss'],
})
export class AppTituloModalAlertComponent {
    @Input() modalHeader: string;
    @Input() modalContent: string;
    @Input() modalType: string;


    constructor(public activeModal: NgbActiveModal) {
        this.modalHeader = 'Header';
        this.modalContent = 'Content';
        this.modalType = 'alert';
    }
}
