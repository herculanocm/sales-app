import { Component, Input } from '@angular/core';
import { ItemDTO } from '@modules/shared/models/item';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-venda-confirm-modal',
  template: `
    <div class="modal-header">
      <h4 class="modal-title" id="modal-basic-title">Selecione o item</h4>
      <button
        type="button"
        class="btn-close"
        aria-label="Close"
        (click)="modal.dismiss('Cross click')"
      ></button>
    </div>
    <div class="modal-body">
      <h5>Existe mais de um item para esse ID Aux</h5>

      <div class="table-responsive">
        <table class="table table-striped table-sm">
          <thead>
            <tr>
            <th scope="col">Selecionar</th>
              <th scope="col">Id</th>
              <th scope="col">Id Aux</th>
              <th scope="col">Nome</th>
              
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let it of itens">
            <td>
                <button class="btn btn-primary botao-acao-sel" (click)="seleciona(it)">Este</button>

            </td>
            <td>{{ it.id }}</td>
            <td>{{ it.idAux }}</td>
            <td>{{ it.nome }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`.botao-acao-sel { padding: 1px 3px 1px 3px }`]
})
export class VendaConfirmModalComponent {
  @Input() itens: ItemDTO[] = [];

  constructor(public modal: NgbActiveModal) {}

  seleciona(item: ItemDTO): void {
    //console.log(item);
    this.modal.close(item);
  }
}