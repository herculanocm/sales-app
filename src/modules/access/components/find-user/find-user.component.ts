import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AccessService } from '@modules/access/access.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { UserAux, AuthoritiesSelectAux, AdminUserDTO, GenericPageable, Organization } from '../../access.utils';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from '../util/modal-confirm.component';

@Component({
  selector: 'app-find-user',
  templateUrl: './find-user.component.html',
  styleUrls: ['find-user.component.scss'],
})
export class FindUserComponent implements OnInit {

  submitted = false;
  statusForm = 1;
  users!: AdminUserDTO[];
  roles: AuthoritiesSelectAux[] = [{ id: 'ROLE_ADMIN', name: 'ROLE_ADMIN' }, { id: 'ROLE_USER', name: 'ROLE_USER' }];
  createForm = new FormGroup({
    id: new FormControl<number|null>(null),
    login: new FormControl<string|null>(null, [Validators.required]),
    firstName: new FormControl<string|null>(null, [Validators.required]),
    lastName: new FormControl<string|null>(null),
    createdBy: new FormControl<string|null>(null),
    activated: new FormControl<boolean|null>(null),
    authorities: new FormControl<AuthoritiesSelectAux[]|null>(null, [Validators.required]),
    createdDate: new FormControl<Date|null>(null),
    email: new FormControl<string|null>(null, [Validators.required, Validators.email]),
    imageUrl: new FormControl<string|null>(null),
    langKey: new FormControl<string|null>(null),
    lastModifiedBy: new FormControl<string|null>(null),
    lastModifiedDate: new FormControl<Date|null>(null),
    disabled: new FormControl<boolean|null>(null),
    singinByApp: new FormControl<boolean|null>(true),
    singinByMSF: new FormControl<boolean|null>(true),
    organizations: new FormControl<Organization[]|null>(null),
  });

  constructor(
    private _accessService: AccessService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private modalService: NgbModal,
  ) { }
  ngOnInit(): void {
    console.log('iniciando');
    this.initForm();
    this.spinner.show();
    this.getUsers();
  }
  onSubmit(): void {
    const values = this.createForm.getRawValue();

    this.submitted = true;
    if (this.createForm.invalid) {
      this.toastr.warning('Existem campos a serem corrigidos', 'Atenção');
    } else {
      console.log(values);
      this.spinner.show();
      this._accessService.postOrPutUser(values, this.statusForm)
        .subscribe({
          next: (data) => {
            console.log(data);
            this.spinner.hide();
            this.submitted = false;
            this.dtoToForm(data);
            this.toastr.success('', 'Adicionado com sucesso');
          },
          error: err => {
            this.spinner.hide();
            console.log(err);
            this.toastr.error('Erro ao realizar requisição', 'Atenção');
          }
        });
    }

  }

  getUsers(): void {
    const page: GenericPageable = {
      page: 0,
      size: 20,
      sort: {
        field: '',
        direction: ''
      }
    };
    this._accessService.getUsers(page)
    .subscribe({
      next: (data) => {
        this.spinner.hide();
        this.users = data;
        this.cdr.detectChanges();
      },
      error: err => {
        console.log(err);
        this.spinner.hide();
        this.cdr.detectChanges();
      }
    });
  }
  dtoToForm(user: UserAux): void {
    this.createForm.reset();

    const authorities: AuthoritiesSelectAux[] = [];
    if (user.authorities != null && user.authorities.length > 0) {
      user.authorities.forEach(auth => {
        const obj = {
          id: auth.name,
          name: auth.name
        };
        authorities.push(obj);
      });
    }
    console.log(authorities);

    this.createForm.patchValue({
      id: user.id,
      login: user.login,
      firstName: user.firstName,
      lastName: user.lastName,
      createdBy: user.createdBy,
      activated: user.activated,
      authorities: authorities,
      createdDate: user.createdDate,
      email: user.email,
      imageUrl: user.imageUrl,
      langKey: user.langKey,
      lastModifiedBy: user.lastModifiedBy,
      lastModifiedDate: user.lastModifiedDate,
      disabled: user.disabled,
      singinByApp: user.singinByApp,
      singinByMSF: user.singinByMSF,
    });
    this.statusForm = 2;
  }

  removeById(login: string): void {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].login === login) {
        this.users.splice(i, 1);
      }
    }
    this.users = [...this.users];
    this.cdr.markForCheck();
  }

  onClear(): void {
    this.createForm.reset();
    this.initForm();
    this.submitted = false;
    this.statusForm = 1;
  }

  initForm(): void {
    this.createForm.patchValue({
      authorities: [{id: 'ROLE_USER', name: 'ROLE_USER'}],
      singinByApp: true,
      singinByMSF: true,
      disabled: false,
    });
  }
  get f() { return this.createForm.controls; }

  compareRoles(s1: AuthoritiesSelectAux, s2: AuthoritiesSelectAux): boolean {
    return s1 && s2 ? s1.id === s2.id : s1 === s2;
  }
  edit(login: string): void {
    this.router.navigate(['pages', 'access', 'user'], { queryParams: { login: login } });
  }
  delete(login: string): void {
    this.modalService.open(NgbdModalConfirmComponent, { ariaLabelledBy: 'modal-basic-title' }).result.then(
			(result) => {
				if (result === 'confirm') {
          this.spinner.show();
          this._accessService.deleteUser(login)
          .subscribe({
            next: (data) => {
              this.removeById(login);
              this.toastr.success('Deletado com sucesso', 'OK');
              this.getUsers();
            }, 
            error: (err) => { this.spinner.hide(); }
          });
        }
			}
		);
  }
}
