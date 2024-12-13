import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-ngbd-modal-confirm',
	template: `
	
	<div class="modal-header">
		<h4 class="modal-title" id="modal-basic-title">{{modalHeader}}</h4>
		<button type="button" class="btn-close" aria-label="Close" (click)="modal.dismiss('Cross click')"></button>
	</div>
	<div class="modal-body">
		<h5>{{modalContent}}</h5>
	</div>
	<div class="modal-footer">
    <div class="col-12">
        <div class="row">
            <div class="col-6 text-center d-grid">
                <button class="btn btn-md btn-danger" (click)="modal.close('confirm')">Sim</button>
            </div>
            <div class="col-6 text-center d-grid">
                <button class="btn btn-md btn-primary" (click)="modal.close('no')">Não</button>
            </div>
        </div>
        </div>
	</div>

	`,
})
export class NgbdModalConfirmComponent {
	@Input() modalHeader = "Atenção";
    @Input() modalContent = "Deseja realmente excluir?";

	constructor(public modal: NgbActiveModal) {}
}