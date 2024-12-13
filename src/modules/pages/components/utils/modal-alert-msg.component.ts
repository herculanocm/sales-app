import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-ngbd-modal-alert-msg',
	template: `
	
	<div class="modal-header">
		<h4 class="modal-title" id="modal-basic-title">{{modalHeader}}</h4>
		<button type="button" class="btn-close" aria-label="Close" (click)="modal.dismiss('Cross click')"></button>
	</div>
	<div class="modal-body">
		<div style="margin-top: 20px;margin-bottom: 20px;" [innerHTML]="modalContent"></div>
	</div>
	<div class="modal-footer">
    <div class="col-12">
        <div class="row">
            <div class="text-center">
                <button class="btn btn-md btn-primary" (click)="modal.close('confirm')">Confirmar e Fechar</button>
            </div>
        </div>
        </div>
	</div>

	`,
})
export class NgbdModalAlertMsgComponent {
	@Input() modalHeader = "";
    @Input() modalContent = "";

	constructor(public modal: NgbActiveModal) {}
}