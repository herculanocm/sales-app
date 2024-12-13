import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-fluxo-modal-alert',
    templateUrl: './app-alert-modal-alert.component.html',
    styleUrls: ['./app-alert-modal-alert.component.scss'],
})
export class AppFluxoAlertModalAlertComponent {
    @Input() modalHeader: string;
    @Input() modalContent: string;
    @Input() modalType: string;


    constructor(public activeModal: NgbActiveModal) {
        this.modalHeader = 'Header';
        this.modalContent = 'Content';
        this.modalType = 'alert';
    }
}
