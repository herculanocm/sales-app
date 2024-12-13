import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-titulos-modal-confirm',
	template: `
	
	<div class="modal-header">
		<h4 class="modal-title" id="modal-basic-title">Atenção</h4>
		<button type="button" class="btn-close" aria-label="Close" (click)="modal.dismiss('Cross click')"></button>
	</div>
	<div class="modal-body">
		<h5>{{message}}</h5>
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
export class NgbdModalConfirmAuxComponent {
    @Input() message = 'Deseja relamente excluir?';
	constructor(public modal: NgbActiveModal) {}
}

@Component({
	selector: 'app-titulos-modal-message-aux',
	template: `
	
	<div class="modal-header">
		<h4 class="modal-title" id="modal-basic-title">{{header}}</h4>
		<button type="button" class="btn-close" aria-label="Close" (click)="modal.dismiss('Cross click')"></button>
	</div>
	<div class="modal-body">
		<div [innerHTML]="htmlBody"></div>
	</div>
	<div class="modal-footer">
    <div class="col-12">
        <div class="row">
            <div class="col-12 text-center d-grid">
                <button class="btn btn-md btn-primary" (click)="modal.close('no')">Ok</button>
            </div>
        </div>
        </div>
	</div>

	`,
})
export class NgbdModalMessageAuxComponent {
    @Input() htmlBody = '';
	@Input() header = '';
	constructor(public modal: NgbActiveModal) {}
}
