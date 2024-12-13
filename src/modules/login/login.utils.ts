import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'app-modal-confirm',
	template: `
	
	<div class="modal-header">
		<h4 class="modal-title" id="modal-basic-title">{{titulo}}</h4>
		<button type="button" class="btn-close" aria-label="Close" (click)="modal.dismiss('Cross click')"></button>
	</div>
	<div class="modal-body">
		<h5>{{message}}</h5>
	</div>
	<div class="modal-footer">
    <div class="col-12">
        <div class="row">
           
            <div class="col-12 text-center d-grid">
                <button class="btn btn-md btn-primary" (click)="modal.close('no')">OK</button>
            </div>
        </div>
        </div>
	</div>

	`,
})
export class NgbdModalMessageComponent {
    @Input() message = 'Conteudo';
    @Input() titulo = 'Atenção';
	constructor(public modal: NgbActiveModal) {}
}