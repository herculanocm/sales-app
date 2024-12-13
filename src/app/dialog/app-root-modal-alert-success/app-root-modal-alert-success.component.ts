import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-root-modal-alert-success',
    templateUrl: './app-root-modal-alert-success.component.html',
    styleUrls: ['./app-root-modal-alert-success.component.scss'],
})
export class AppRootModalAlertSuccessComponent {
    @Input() modalHeader: string;
    @Input() modalContent: string;

    constructor(public activeModal: NgbActiveModal) {
        this.modalHeader = 'Header';
        this.modalContent = 'Content';
    }
}
