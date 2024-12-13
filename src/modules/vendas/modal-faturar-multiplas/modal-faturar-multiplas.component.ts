import { AfterViewInit, Component, Input } from '@angular/core';
import { FaturarVendaReturn } from '@modules/shared/models/venda';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-modal-faturar-multiplas',
  templateUrl: './modal-faturar-multiplas.component.html',
  styleUrls: ['./modal-faturar-multiplas.component.scss'],
})
export class ModalFaturarMultiplasComponent implements AfterViewInit {

  @Input() faturarVendaReturn!: FaturarVendaReturn;
  constructor(public activeModal: NgbActiveModal, private toastr: ToastrService) { }

  ngAfterViewInit(): void {
    this.faturarVendaReturn.faturarVendaItemReturns.forEach((item) => {
      if (item.status === true) {
        item.imprimir = false;
      }
    });
  }

  printAllSelected() {
    const filter = this.faturarVendaReturn.faturarVendaItemReturns.filter((item) => item.imprimir === true);
    if (filter.length > 0) {
      this.activeModal.close(filter);
    } else {
      this.toastr.warning('Nenhuma selecionada', '');
    }
  }

  selecionarTodasAsVendas() {
    this.faturarVendaReturn.faturarVendaItemReturns.forEach((item) => {
      item.imprimir = true;
    });
  }

}
