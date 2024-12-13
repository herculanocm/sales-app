import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-vendas-confirm',
  templateUrl: './modal-confirm.component.html',
  styleUrls: ['./modal-confirm.component.scss'],
})
export class ModalVendasConfirmComponent {
  @Input() modalHeader!: string;
  @Input() modalContent!: string;
  @Input() textButtonYes!: string;
  @Input() textButtonNo!: string;
  constructor(public activeModal: NgbActiveModal) {}
}

