import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ItemFornecedorPadraoDTO } from '@modules/shared/models/item';
import { ItemService } from '@modules/shared/services';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-itens-modal-item-fornecedor',
    templateUrl: './item-fornecedor.component.html',
    styleUrls: ['./item-fornecedor.component.scss'],
})
export class ItemFornecedorPadraoModalComponent implements OnInit {
    submitted = false;
    itemFornecedorPadraos: ItemFornecedorPadraoDTO[] = [];
    saveForm = new FormGroup({
        nome: new FormControl('', [Validators.required]),
    });

    get f() { return this.saveForm.controls; }

    constructor(
        public activeModal: NgbActiveModal,
        private _itemService: ItemService,
        private spinner: NgxSpinnerService,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
    ) {
    }
    ngOnInit(): void {
        this.buscaFornecedorPadrao();
    }

    deleteFornecedorPadrao(id: number | null): void {
        this.spinner.show('fullSpinner');
        this._itemService.deleteItemFornecedorPadrao(id)
        .subscribe({
            next: () => {
                this.toastr.success('Fornecedor excluído com sucesso', 'Sucesso');
                this.buscaFornecedorPadrao();
                this.spinner.hide('fullSpinner');
            },
            error: () => {
                this.toastr.error('Erro ao excluir fornecedor, provavelmente ele está sendo usado em algum item, remova primeiro para depois excluir', 'Erro');
                this.spinner.hide('fullSpinner');
            }
        });
    }

    onSubmit() {
        this.submitted = true;
        const rawForm = this.saveForm.getRawValue();
        console.log(rawForm);
        if (this.saveForm.invalid) {
            this.toastr.error('Preencha todos os campos obrigatórios', 'Erro');
            return;
        }

        const forncedor: ItemFornecedorPadraoDTO = {
            id: null,
            nome: rawForm.nome,
            status: true
        }
        this.spinner.show('fullSpinner');
        this._itemService.postOrPutItemFornecedorPadrao(forncedor, 1)
        .subscribe({
            next: () => {
                this.toastr.success('Fornecedor salvo com sucesso', 'Sucesso');
                this.buscaFornecedorPadrao();
                this.spinner.hide('fullSpinner');
                this.saveForm.reset();
            },
            error: () => {
                this.toastr.error('Erro ao salvar fornecedor', 'Erro');
                this.spinner.hide('fullSpinner');
            }
        });
    }

    buscaFornecedorPadrao(): void {
        this._itemService.getAllItemFornecedorActivePadrao()
        .subscribe({
            next: (data) => {
                this.itemFornecedorPadraos = data;
                this.cdr.detectChanges();
            },
            error: () => {
                this.toastr.error('Erro ao buscar fornecedores', 'Erro');
            }
        });
    }
}
