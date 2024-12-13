import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EstoqueAlmoxarifadoDTO } from '@modules/shared/models/item';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-venda-modal-confirm-alx',
    templateUrl: './app-venda-modal-confirm-alx.component.html',
    styleUrls: ['./app-venda-modal-confirm-alx.component.scss'],
})
export class AppVendaModalAlxConfirmComponent implements OnInit {
    @Input() modalHeader: string;
    @Input() modalContent: string;
    @Input() estoqueAlmoxarifados!: EstoqueAlmoxarifadoDTO[];
    submitted!: boolean;
    movForm!: FormGroup;

    constructor(public activeModal: NgbActiveModal) {
        this.modalHeader = 'Header';
        this.modalContent = 'Content';
    }

    get f() { return this.movForm.controls; }

    createForm(): void {
        this.movForm = new FormGroup({
            estoqueAlmoxarifadoId: new FormControl(2, Validators.required),
        });
    }

    ngOnInit(): void {
        this.createForm();
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
    }

    fechar(code: number): void {
        if (code === 1) {
            this.submitted = true;
            if (this.movForm.valid) {
                const obj = this.movForm.getRawValue();
                obj.code = code;
                this.activeModal.close(obj);
            }
        }
    }
}
