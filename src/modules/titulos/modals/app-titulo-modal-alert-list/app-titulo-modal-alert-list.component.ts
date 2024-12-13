import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageAlertList } from './app-titulo-modal-alert-list-utils';

@Component({
    selector: 'app-titulo-modal-alert-list',
    templateUrl: './app-titulo-modal-alert-list.component.html',
    styleUrls: ['./app-titulo-modal-alert-list.component.scss'],
})
export class AppTituloModalAlertListComponent {
    @Input() modalHeader: string;
    @Input() modalDetail!: string;
    @Input() modalMessageList!: MessageAlertList[];
    @Input() modalType: string;


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
