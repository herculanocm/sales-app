import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-titulo-modal-alert-valid',
    templateUrl: './app-titulo-modal-alert-valid.component.html',
    styleUrls: ['./app-titulo-modal-alert-valid.component.scss'],
})
export class AppTituloModalAlertValidComponent {
    @Input() modalHeader: string;
    @Input() modalType: string;
    @Input() validaTitulos!: any[];


    constructor(public activeModal: NgbActiveModal) {
        this.modalHeader = 'Header';
        this.modalType = 'alert';
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
    }
    
    isUndefined(value: any): boolean {
        return typeof(value) === 'undefined';
    }
}
