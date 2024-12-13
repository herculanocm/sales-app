import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PcFilial } from '@modules/shared/models/totvs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-filial-modal-confirm',
    templateUrl: './app-filial-modal-confirm.component.html',
    styleUrls: ['./app-filial-modal-confirm.component.scss'],
})
export class AppFilialComponent {
    @Input() modalHeader: string;
    @Input() modalContent: string;
    @Input() modalType: string;
    @Input() confirmLabel: string;
    @Input() defaultLabel: string;
    @Input() filiais: PcFilial[] = [];
    submitted = false;

    pedidoForm = new FormGroup({
        filial: new FormControl<PcFilial | null>(null, [Validators.required])
    });

    get f() { return this.pedidoForm.controls; }

    constructor(public activeModal: NgbActiveModal, private toastr: ToastrService) {
        this.modalHeader = 'Header';
        this.modalContent = 'Content';
        this.modalType = 'alert';
        this.confirmLabel = 'Sim';
        this.defaultLabel = 'Ok';
    }

    envio(): void {
        this.submitted = true;
        const filial: PcFilial | any = this.pedidoForm.getRawValue();
        if (this.pedidoForm.invalid) {
            this.toastr.error('Selecione uma filial', 'Atenção');
        } else {
            this.activeModal.close(filial);
        }
    }

    compareFilial(c1: PcFilial, c2: PcFilial): boolean {
        return c1 && c2 ? c1.codigo === c2.codigo : c1 === c2;
    }
}
