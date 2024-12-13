import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-vendas-alert',
  templateUrl: './modal-alert.component.html',
  styleUrls: ['./modal-alert.component.scss'],
})
export class ModalVendasAlertComponent {
  @Input() modalHeader!: string;
  @Input() modalContent!: string;
  constructor(public activeModal: NgbActiveModal) {}
}
