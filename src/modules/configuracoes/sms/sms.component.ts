import { Component, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { TwilioSMSService } from '@modules/shared/services';
import { TwilioSMSBodyAux } from '@modules/shared/models/configuracoes';

@Component({
    selector: 'app-twilio-sms',
    templateUrl: './sms.component.html',
    styleUrls: ['./sms.component.scss'],
    providers: [],
})
export class TwilioSMSComponent {

    smsForm = new FormGroup({
        phoneTo: new FormControl(null, [Validators.required]),
        smsText: new FormControl(null, [Validators.required]),
    })

    submitted = false;

    constructor(
        private spinner: NgxSpinnerService,
        private cdr: ChangeDetectorRef,
        private toastr: ToastrService,
        private _serv: TwilioSMSService,
    ) { }

    onSend(): void {
        this.submitted = true;
        if (this.smsForm.invalid) {
            this.pop('warning', 'Atenção', 'Existe campos que ainda precisam ser preenchidos');
        } else {
            const smsBody: TwilioSMSBodyAux | null = this.smsForm.getRawValue();
            console.log(smsBody);
            this.spinner.show();
            this._serv.sendSMS(smsBody!)
            .subscribe({
                next: data => {
                    this.spinner.hide();
                    console.log(data);
                },
                error: err => {
                    this.spinner.hide();
                    console.log(err);
                }
            });
        }
    }
    onLimpa(): void {
        this.submitted = false;
        this.smsForm.reset();
    }
    get f() { return this.smsForm.controls; }
    pop(tipo: string, titulo: string, msg: string): void {
        if (tipo === 'error') {
            this.toastr.error(msg, titulo);
        } else if (tipo === 'success') {
            this.toastr.success(msg, titulo);
        } else if (tipo === 'warning') {
            this.toastr.warning(msg, titulo);
        } else {
            this.toastr.info(msg, titulo);
        }
    }
}
