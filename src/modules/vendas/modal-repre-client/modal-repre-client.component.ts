import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ClienteVendedorDTO } from '@modules/shared/models/cliente';
import { FuncionarioDTO } from '@modules/shared/models/funcionario';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-repre-client',
  templateUrl: './modal-repre-client.component.html',
  styleUrls: ['./modal-repre-client.component.scss'],
})
export class ModalRepreClientComponent {

    @Input() representantes: ClienteVendedorDTO[] = [];
    constructor(public activeModal: NgbActiveModal) {}
  
}
