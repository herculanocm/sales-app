import { Component, Input } from '@angular/core';
import { CheckVendaDTO } from '@modules/shared/models/romaneio';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rom-modal-msgs',
  templateUrl: './app-rom-modal-msgs.component.html',
  styleUrls: ['./app-rom-modal-msgs.component.scss'],
})
export class AppModalRomaneioAddMultiplasComponent {

  @Input() checkVendas: CheckVendaDTO[] = [];
  
  constructor(public activeModal: NgbActiveModal, private toastr: ToastrService) { }
}
