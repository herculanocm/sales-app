import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthUtilsService } from '@modules/auth-utils/auth-utils.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'environments/environment';
import { NgbdModalConfirmComponent } from '../util/modal-confirm.component';


@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['roles.component.scss'],
})
export class RolesComponent implements OnInit {

  submitted = false;
  statusForm = 1;
  roles: string[] = [];

  createForm = new FormGroup({
    role: new FormControl(null, [Validators.required]),
  });

  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private cdr: ChangeDetectorRef,
    private _authUtilsService: AuthUtilsService,
    private modalService: NgbModal,
  ) { }
  ngOnInit(): void {
    console.log('iniciando');
    this.getAuthorities();
  }

  onSubmit(): void {
    const values = this.createForm.getRawValue();
    this.submitted = true;
    if (this.createForm.invalid) {
      this.toastr.warning('Existem campos a serem corrigidos', 'Atenção');
    } else {
      this.spinner.show();
      this._authUtilsService.saveAuthoritiesPublicUser(values.role)
        .subscribe({
          next: (data) => {
            this.spinner.hide();
            this.submitted = false;
            this.createForm.reset();
            this.roles = [...data];
            this.cdr.markForCheck();
            this.toastr.success('Adicionado com sucesso', 'OK');
          },
          error: err => {
            this.spinner.hide();
            console.log(err);
            this.toastr.error('Erro ao buscar papeis', 'ERRO');
          }
        });
    }
  }
  onClear(): void {
    this.createForm.reset();
    this.submitted = false;
    this.statusForm = 1;
    this.getAuthorities();
    this.cdr.markForCheck();
  }
  get f() { return this.createForm.controls; }

  getAuthorities(): void {
    this._authUtilsService.getAuthoritiesPublicUser()
      .subscribe({
        next: (data) => {
          this.spinner.hide();
          this.roles = [...data];
          this.cdr.markForCheck();
        },
        error: err => {
          this.spinner.hide();
          console.log(err);
          this.toastr.error('Erro ao buscar papeis', 'ERRO');
        }
      });
  }

  permitDelete(role: string): boolean {
    return environment.ROLES_DEFAULT.includes(role);
  }

  getNameRole(role: string): string {
    return this._authUtilsService.getRoleNameCut(role);
  }

  delete(role: string): void {
    this.modalService.open(NgbdModalConfirmComponent, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        if (result === 'confirm') {
          this.spinner.show();
          this._authUtilsService.deleteAuthoritiesPublicUser(role)
            .subscribe({
              next: (data) => {
                this.spinner.hide();
                this.roles = [...data];
                this.submitted = false;

                this.toastr.success('Deletado com sucesso', 'OK');
                this.cdr.markForCheck();
              },
              error: err => {
                this.spinner.hide();
                console.log(err);
                this.toastr.error('Erro ao deletar papel, contate o administrador', 'Atenção');
              }
            });
        }
      }
    );
  }
}
