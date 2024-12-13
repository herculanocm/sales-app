import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ErrorSales } from '@modules/shared/components/fields-erro/error';
import { Profile } from './profile.model';
import { ProfileService } from '@modules/shared/services';
import { passwordFormatValidator, passwordMatchValidator } from '@modules/shared/components/functions';
import { FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
    statusForm: number;
    errorForm: ErrorSales | undefined;
    userProfile!: Profile;
    currentUserSalesApp: any;
    submitted = false;
    public selectedFiles: any;

    changeForm = new FormGroup({
        password: new FormControl<string | null>(null, [Validators.required, Validators.minLength(8), Validators.maxLength(12)]),
        password2: new FormControl<string | null>(null, [Validators.required, Validators.minLength(8), Validators.maxLength(12)])
    }, { validators: [passwordMatchValidator, passwordFormatValidator] });


    constructor(
        private _profileService: ProfileService,
        private toastr: ToastrService,
        private spinner: NgxSpinnerService,
    ) {
        this.statusForm = 1;
    }

    ngOnInit() {
        this.currentUserSalesApp = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);

        this.userProfile = new Profile(
            this.currentUserSalesApp.user.id,
            this.currentUserSalesApp.user.login,
            this.currentUserSalesApp.user.firstName,
            this.currentUserSalesApp.user.lastName,
            this.currentUserSalesApp.user.email);
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

    limparSenha(): void {
        this.submitted = false;
        this.changeForm.reset();
    }

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


    onCadastra() {
        this._profileService.salvaProfile(this.userProfile)
            .subscribe({
                next: (data: any) => {
                    // console.log(data);
                    sessionStorage.removeItem('currentUserSalesApp');
                    this.alteraDados();
                    sessionStorage.setItem('currentUserSalesApp', JSON.stringify(this.currentUserSalesApp));
                    this.pop('success', 'Sucesso', data.msg);
                },
                error: (err) => {
                    // console.log(err);
                    // console.log(err);
                    if (Object.prototype.hasOwnProperty.call(err, 'error') && err.error != null) {
                        this.errorForm = err.error;
                    }
                    this.pop('error', 'Erro', 'Erro ao realizar requisição');
                }
            });
    }
    alteraDados(): void {
        this.currentUserSalesApp.user.firstName = this.userProfile.firstName;
        this.currentUserSalesApp.user.lastName = this.userProfile.lastName;
        this.currentUserSalesApp.user.email = this.userProfile.email;
    }
    alterarSenha(): void {
        if (this.userProfile.senhaNova == null ||
            this.userProfile.senhaNova2 == null) {
            this.pop('error', 'Erro', 'Todos os campos devem ser digitados! digite a nova senha e repita novamente');
        } else if (this.userProfile.senhaNova !== this.userProfile.senhaNova2) {
            this.pop('error', 'Erro', 'As senhas não conferem');
        } else {
            this._profileService.resetaPassword(this.userProfile.senhaNova2)
                .subscribe({
                    next: (data: any) => {
                        console.log('accessing: ', data);
                    },
                    error: (err) => {
                        console.log('removing: ', err);
                    }
                });
        }
    }
    onKeydownAlteraSenha(): void {
        this.alterarSenha();
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
                        this.toastr.success('Reset realizado com sucesso', '');
                        this.limparSenha();
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
