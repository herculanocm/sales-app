import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ItemUnidadeDTO } from '@modules/shared/models/item';
import {
  MovimentoItemDTO,
} from '@modules/shared/models/movimento';
import { MovService } from '@modules/shared/services';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-modal-find-movimento',
  templateUrl: './modal-find-movimento.component.html',
  styleUrls: ['./modal-find-movimento.component.scss']
})
export class ModalFindMovimentoComponent {
  modalForm = new FormGroup({
    movimentoId: new FormControl<number | null>(null, [Validators.required]),
  });
  submitted = false;
  movs: MovimentoItemDTO[] = [];

  constructor(
    public modal: NgbActiveModal,
    private toastr: ToastrService,
    private _mov: MovService,
    private spinner: NgxSpinnerService,
    private cdr: ChangeDetectorRef
  ) {}
  get f() {
    return this.modalForm.controls;
  }
  onPesquisa(): void {
    const values = this.modalForm.getRawValue();
    this.submitted = true;
    if (this.modalForm.invalid) {
      this.toastr.error('Digite um valor válido', 'Atenção');
    } else {
      this.spinner.show('modalSpinner');
      this._mov.findById(values.movimentoId!).subscribe({
        next: (data) => {
          this.spinner.hide('modalSpinner');
          this.movs = [...data.movimentoItemDTOs];
          this.movs.sort((v1, v2) => {
            if (v1.ordemInclusaoTimestamp < v2.ordemInclusaoTimestamp) {
                return -1;
            }
            if (v1.ordemInclusaoTimestamp > v2.ordemInclusaoTimestamp) {
                return 1;
            }
            return 0;
        });
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.spinner.hide('modalSpinner');
          this.toastr.warning(
            'Digite código de movimento válido ou contate o administrador',
            'Erro'
          );
        },
      });
      //this.modal.close(values);
    }
  }
  compareUnidade(c1: ItemUnidadeDTO, c2: ItemUnidadeDTO): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
  compareBoolean(c1: boolean, c2: boolean): boolean {
    return c1 === c2;
  }
  valorUntoValor(mov: MovimentoItemDTO): void {
    if (mov.valorUnitario > 0 && mov.qtd > 0 && mov.itemUnidadeDTO!.fator > 0) {
      mov.valor = mov.valorUnitario * (mov.qtd * mov.itemUnidadeDTO!.fator);
    }
  }

  geraEstoque(event: Event): void {
  const selectElement = event.target as HTMLSelectElement; // Cast the event target to an HTMLSelectElement
  const value = selectElement.value; // Get the value of the select element

  if (value === 'true') {
    this.movs.forEach(m => {
      m.indGeraEstoque = true;
    });
    this.movs = [...this.movs];
  } else if (value === 'false') {
    this.movs.forEach(m => {
      m.indGeraEstoque = false;
    });
    this.movs = [...this.movs];
  }
  }

  geraPreco(event: Event): void {
    const selectElement = event.target as HTMLSelectElement; // Cast the event target to an HTMLSelectElement
    const value = selectElement.value; // Get the value of the select element
    if (value === 'true') {
      this.movs.forEach(m => {
        m.indGeraPreco = true;
      });
      this.movs = [...this.movs];
    } else if (value === 'false') {
      this.movs.forEach(m => {
        m.indGeraPreco = false;
      });
      this.movs = [...this.movs];
    }
  }

  fechar(): void {
    const flt = this.movs.filter(m => {
      return ((m.indGeraEstoque === true && m.qtd < 1) || (m.indGeraPreco === true && m.valor < 1));
    });
    if (flt.length > 0) {
      this.toastr.warning(
        'Corrija os campos, se gerar estoque ou valor os campos tem que ser maior que zero',
        'Atenção'
      );
    } else {
      this.modal.close(this.movs);
    }
  }
}
