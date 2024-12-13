import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-root-modal-alert-error',
    templateUrl: './app-root-modal-alert-error.component.html',
    styleUrls: ['./app-root-modal-alert-error.component.scss'],
})
export class AppRootModalAlertErrorComponent {
    @Input() modalHeader: string;
    @Input() modalContent: string;

    constructor(public activeModal: NgbActiveModal) {
        this.modalHeader = 'Header';
        this.modalContent = 'Content';
    }
}
