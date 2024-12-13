import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-venda-modal-cliente-list',
    templateUrl: './app-venda-modal-cliente-list.component.html',
    styleUrls: ['./app-venda-modal-cliente-list.component.scss'],
})
export class AppVendaModalClienteListComponent {
    @Input() modalHeader: string;
    @Input() modalContent: any;


    constructor(public activeModal: NgbActiveModal) {
        this.modalHeader = 'Header';
        this.modalContent = 'Content';
    }
    isArray(value: any): boolean {
        return Array.isArray(value);
    }
}
