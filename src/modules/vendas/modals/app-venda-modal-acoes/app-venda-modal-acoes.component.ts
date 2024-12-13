import { Component, Input } from '@angular/core';
import { VersoesList } from '@modules/shared/models/romaneio';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-venda-modal-alert-acoes',
    templateUrl: './app-venda-modal-acoes.component.html',
    styleUrls: ['./app-venda-modal-acoes.component.scss'],
})
export class AppVendaModalAlertAcoesVendaComponent {
    @Input() modalHeader: string;
    @Input() modalContent: string;
    @Input() modalType: string;
    @Input() versoesList!: VersoesList;


    constructor(public activeModal: NgbActiveModal) {
        this.modalHeader = 'Header';
        this.modalContent = 'Content';
        this.modalType = 'alert';
    }
}
