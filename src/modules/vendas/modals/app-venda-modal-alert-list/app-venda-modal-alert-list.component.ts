import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MessageAlertList } from './app-venda-modal-alert-list-utils';

@Component({
    selector: 'app-venda-modal-alert-list',
    templateUrl: './app-venda-modal-alert-list.component.html',
    styleUrls: ['./app-venda-modal-alert-list.component.scss'],
})
export class AppVendaModalAlertListComponent {
    @Input() modalHeader: string;
    @Input() modalMessageList!: MessageAlertList[];
    @Input() modalType: string;


    constructor(public activeModal: NgbActiveModal) {
        this.modalHeader = 'Header';
        this.modalType = 'alert';
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
    }
}
