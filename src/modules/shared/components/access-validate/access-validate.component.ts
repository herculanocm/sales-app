import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '@modules/shared/services';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-modal-access-validate',
  templateUrl: './access-validate.component.html',
  styleUrls: ['./access-validate.component.scss']
})
export class AccessValidateComponent {

  @Input() modalHeader!: string;
  @Input() modalContent!: string;

  messageValidation = '';

  modalForm = new FormGroup({
    username: new FormControl<string | null>(null, [Validators.required]),
    password: new FormControl<string | null>(null, [Validators.required]),
  });

  submitted = false;

  constructor(
    public modal: NgbActiveModal,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private cdr: ChangeDetectorRef,
    private _loginService: LoginService
  ) { }
  get f() {
    return this.modalForm.controls;
  }

  validarPassword() {
    this.submitted = true;

    if (this.modalForm.invalid) {
      this.toastr.error('Atenção aos campos', '');
      return;
    } else {

      const formValues = this.modalForm.getRawValue();
      this.spinner.show('modalValidateUserSpinner');
      this._loginService.login(formValues.username!, formValues.password!)
        .subscribe({
          next: () => {
            this.spinner.hide('modalValidateUserSpinner');
            this.toastr.success('Login validado com sucesso', '');
            this.modal.close({ validate: true });
          },
          error: (err) => {
            this.spinner.hide('modalValidateUserSpinner');
            console.error(err);
            this.messageValidation = 'Usuário ou senha inválidos';
            this.cdr.markForCheck();
          }
        });

    }
  }
}
