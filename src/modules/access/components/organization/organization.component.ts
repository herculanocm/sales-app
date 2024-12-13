import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthUtilsService } from '@modules/auth-utils/auth-utils.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Organization } from '../../access.utils';
import { AccessService } from '@modules/access/access.service';
import { NgbdModalConfirmComponent } from '../util/modal-confirm.component';
import { errors } from '@modules/pages/services-utils/error.codes';

@Component({
  selector: 'app-organizations',
  templateUrl: './organization.component.html',
  styleUrls: ['organization.component.scss'],
})
export class OrganizationComponent implements OnInit {

  submitted = false;
  statusForm = 1;
  companies: Organization[] = [];

  createForm = new FormGroup({
    id: new FormControl<number|null>(null),
    name: new FormControl<string|null>(null, [Validators.required, Validators.maxLength(255)]),
    description: new FormControl<string|null>(null, [Validators.maxLength(255)]),
    enableState: new FormControl<boolean|null>(true),
  });

  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private cdr: ChangeDetectorRef,
    private _authUtilsService: AuthUtilsService,
    private modalService: NgbModal,
    private accessService: AccessService,
  ) { }

  ngOnInit(): void {
    console.log('iniciando');
    this.resertForm();

    this.getAllCompanys();
  }

  onSubmit(): void {
    const values = this.createForm.getRawValue();
    this.submitted = true;
    if (this.createForm.invalid) {
      this.toastr.warning('Existem campos a serem corrigidos', 'Atenção');
    } else {
      this.spinner.show();
      const company = values;
      console.log(company);
      this.accessService.postOrPutOrganization(company, this.statusForm)
        .subscribe({
          next: (data) => {
            this.spinner.hide();
            let messageSuccess = '';
            if (this.statusForm === 1) {
              messageSuccess = 'Cadastrada com sucesso';
            } else {
              messageSuccess = 'Alterado com sucesso';
            }
            this.toastr.success(messageSuccess, 'OK');
            this.submitted = false;
            this.resertForm();
            this.statusForm = 1;
            this.getAllCompanys();
          },
          error: (err) => {
            this.spinner.hide();
            this.cdr.markForCheck();
            this.toastr.error('Erro ao cadastrar empresa', 'ERROR');
          }
        });
    }
  }



  getAllCompanys(): void {
    this.accessService.getAllOrganization()
      .subscribe({
        next: (data) => {
          this.spinner.hide();
          this.companies = [...data];
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.spinner.hide();
          this.cdr.markForCheck();
          this.toastr.error('Erro ao buscar empresas', 'ERROR');
        }
      });
  }

  onClear(): void {
    this.resertForm();
    this.submitted = false;
    this.statusForm = 1;
    this.getAllCompanys();
    this.cdr.markForCheck();
  }

  resertForm(): void {
    this.createForm.reset();
    this.createForm.controls.id.disable();
    this.createForm.controls.enableState.setValue(true);
  }
  get f() { return this.createForm.controls; }


  removeById(id: number): void {
    for (let i = 0; i < this.companies.length; i++) {
      if (this.companies[i].id === id) {
        this.companies.splice(i, 1);
      }
    }
    this.companies = [...this.companies];
    this.cdr.markForCheck();
  }

  editCompany(company: Organization): void {
    this.createForm.patchValue({
      id: company.id,
      name: company.name,
      description: company.description,
      enableState: company.enableState,
    });
    this.statusForm = 2;
    this.toastr.warning('Você está alterando agora!', 'Atenção');
  }

  permitEditOrDelete(company: Organization): boolean {
    if (company.id == 1) {
      return true;
    } else {
      return false;
    }
  }

  deleteCompany(company: Organization): void {
    this.modalService.open(NgbdModalConfirmComponent, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        if (result === 'confirm') {
          this.spinner.show();
          this.accessService.deleteOrganizationById(company.id)
            .subscribe({
              next: (data) => {
                this.submitted = false;
                this.removeById(company.id);
                this.toastr.success('Deletado com sucesso', 'OK');
                this.getAllCompanys();
              },
              error: err => {
                this.spinner.hide();
                console.log(err);
                console.log(err.error);

                if (Object.prototype.hasOwnProperty.call(err, 'error') && Object.prototype.hasOwnProperty.call(err.error, 'code')) {
                  const flt = errors.filter(er => {
                    return err.error.code === er.code;
                  });
                  let message = '';
                  if (flt.length > 0) {
                    message = flt[0].ptbr;
                  }
                  this.toastr.warning(message, 'Atenção');
                } else {
                  this.toastr.error('Erro ao deletar a empresa, contate o administrador', 'Atenção');
                }
              }
            });
        }
      }
    );
  }
}
// .subscribe({
//   next: (data) => {},
//   error: (err) => {}
// });
