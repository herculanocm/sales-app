import { Component, Input, OnInit } from '@angular/core';
import { CheckListVeiculoImageDTO } from '@modules/shared/models/generic';
import { CheckListVeiculoService } from '@modules/shared/services';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-venda-modal-checklist-img',
    templateUrl: './app-venda-modal-checklist-img.component.html',
    styleUrls: ['./app-venda-modal-checklist-img.component.scss'],
})
export class AppVendaModalChecklistImgComponent implements OnInit {
    @Input() modalHeader: string;
    @Input() itemImg!: CheckListVeiculoImageDTO;


    constructor(
        public activeModal: NgbActiveModal,
        private _service: CheckListVeiculoService,
        private spinner: NgxSpinnerService,
    ) {
        this.modalHeader = 'Header';
    }
    ngOnInit(): void {
        this.itemImg.nome = this.itemImg.fileName.replace(/\.[^/.]+$/, '');
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
    }

    enviarImg(): void {
        this.spinner.show('uploadSpinner');
        this.itemImg.fileName = (this.itemImg.nome + '.' + this.itemImg.extencao);
        this._service.postImagem(this.itemImg)
            .subscribe((data) => {
                this.spinner.hide('uploadSpinner');
                this.activeModal.close({ resposta: 1 });
            }, (err) => {
                this.spinner.hide('uploadSpinner');
                this.activeModal.close({ resposta: 0 });
            });
    }
}
