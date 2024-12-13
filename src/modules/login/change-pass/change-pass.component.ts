import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ProfileService } from '@modules/shared/services';
import { NgbdModalMessageComponent } from '../login.utils';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { passwordFormatValidator, passwordMatchValidator } from '@modules/shared/components/functions';


@Component({
    selector: 'app-change-pass',
    templateUrl: './change-pass.component.html',
    styleUrls: ['./change-pass.component.scss']
})
export class ChangePassComponent implements OnInit {

    msgSpinner = '';
    title = 'Atenção vamos ativar a sua conta e trocar de senha';
    subTitle = 'Escolha uma senha que contenha entre 8 e 12 caracteres, sendo números e letras com pelo menos um caractere especial ex: (&#64;#$%&*)';
    jwtInvalid = true;

    submitted = false;
    changeForm = new FormGroup({
        password: new FormControl<string | null>(null, [Validators.required, Validators.minLength(8), Validators.maxLength(12)]),
        password2: new FormControl<string | null>(null, [Validators.required, Validators.minLength(8), Validators.maxLength(12)])
    }, { validators: [passwordMatchValidator, passwordFormatValidator] });

    constructor(
        private spinner: NgxSpinnerService,
        public _router: Router,
        private toastr: ToastrService,
        private _profileService: ProfileService,
        private _modalService: NgbModal,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.route.queryParamMap.subscribe(params => {
            ///this.spinner.show();
            this.msgSpinner = 'Validando token de reset de senha, aguarde...';
            const paramJwt = params.get('jwt');
            console.log(paramJwt);
        });
    }

    get f() { return this.changeForm.controls; }

    getFormValidationErrorsV2(form: FormGroup) {
        const result: any[] = [];
        Object.keys(form.controls).forEach(key => {

            const controlErrors: ValidationErrors | null = form.get(key)!.errors;
            if (controlErrors) {
                Object.keys(controlErrors).forEach(keyError => {
                    result.push({
                        'control': key,
                        'error': keyError,
                        'value': controlErrors[keyError]
                    });
                });
            }
        });

        return result;
    }

    onChagePass(): void {
        this.submitted = true;
        if (this.changeForm.invalid) {
            console.log(this.getFormValidationErrorsV2(this.changeForm));
            this.toastr.warning('Corrija os campos para realizar o reset de senha', 'Atenção');
        } else {
            this.spinner.show();
            this._profileService.resetaPassword(this.changeForm.controls['password2'].value)
                .subscribe({
                    next: () => {
                        this.spinner.hide();

                        const activeModal = this._modalService.open(NgbdModalMessageComponent, { ariaLabelledBy: 'modal-basic-title' });
                        activeModal.componentInstance.titulo = 'ATENÇÃO';
                        activeModal.componentInstance.message = `A sua senha foi alterada com sucesso`;
                        activeModal.result.then(() => {
                            this._router.navigate(['login', 'logout']);
                        }, () => { this._router.navigate(['login', 'logout']); });

                    },
                    error: (err) => {
                        this.spinner.hide();
                        console.log(err);
                        this.toastr.error('Contate o administrador, erro ao resetar a senha', 'Erro');
                    }
                });
        }
    }

    isPasswordMismatch(): boolean {
        if (this.changeForm.hasError('passwordMismatch')) {
            return true;
        }
        return false;
    }

    isPasswordMisformat(): boolean {
        let aindaNaoValidar = false;
        let vlr = false;
        const errors = this.getFormValidationErrorsV2(this.changeForm);
        if (errors.length > 0) {
            errors.forEach((err: any) => {
                if (err.control === 'password2') {
                    aindaNaoValidar = true;
                }
            });
        }

        if (this.isPasswordMismatch()) {
            aindaNaoValidar = true;
        }

        if (aindaNaoValidar === false) {
            if (this.changeForm.hasError('passwordFormat')) {
                vlr = true;
            }
        }


        return vlr;
    }

    isPassword2Error(): boolean {
        let vlr = false;
        if (this.submitted === true) {
            const errors = this.getFormValidationErrorsV2(this.changeForm);
            if (errors.length > 0) {
                errors.forEach((err: any) => {
                    if (err.control === 'password2') {
                        vlr = true;
                    }
                });
            }

            if (this.isPasswordMismatch() || this.isPasswordMisformat()) {
                vlr = true;
            }
        }
        return vlr;
    }
}
