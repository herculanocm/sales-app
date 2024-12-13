import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AccessService } from '@modules/access/access.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthoritiesSelectAux, AdminUserDTO, GenericPageable, Organization } from '../../access.utils';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { AuthUtilsService } from '@modules/auth-utils/auth-utils.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from '../util/modal-confirm.component';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['create-user.component.scss'],
})
export class CreateUserComponent implements OnInit {

  submitted = false;
  statusForm = 1;
  userLoginIn!: string;
  users!: AdminUserDTO[];
  roles: AuthoritiesSelectAux[] = [];
  organizations: Organization[] = [];
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
    private _authUtilsService: AuthUtilsService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
  ) { }
  ngOnInit(): void {
    console.log('iniciando');
    this.getAuthorities();
    this.getUsers();
    this.getOrganizations();
    this.initForm();

    this.userLoginIn = this.route.snapshot.queryParamMap.get('login')!;
    if (this.userLoginIn != null && this.userLoginIn.length > 0) {
      this.spinner.show();
      this._accessService.getUserByLogin(this.userLoginIn)
        .subscribe({
          next: (data) => {
            this.spinner.hide();
            this.statusForm = 2;
            console.log(data);

            this.dtoToForm(data);

            this.cdr.detectChanges();
          },
          error: (err) => {
            this.spinner.hide();
            this.toastr.error('Contate o administrator', 'ERRO');
          }
        });
    }
  }

  getAuthorities(): void {
    this._authUtilsService.getAuthoritiesPublicUser()
      .subscribe({
        next: (data) => {
          const rolesAux: AuthoritiesSelectAux[] = [];
          data.forEach(rl => {
            rolesAux.push({ id: rl, name: this._authUtilsService.getRoleNameCut(rl) });
          });
          this.roles = [...rolesAux];
          this.cdr.markForCheck();
          //console.log(this.roles);
        },
        error: err => {
          console.log(err);
          this.toastr.error('Erro ao buscar authorities', 'ERRO');
        }
      });
  }

  getOrganizations(): void {
    this._accessService.getAllEnableOrganization()
    .subscribe({
      next: (data) => {
        this.organizations = data;
        this.cdr.markForCheck();
      },
      error: err => {
        console.log(err);
        this.toastr.error('Erro ao buscar organizações', 'ERRO');
      }
    });
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
    this.spinner.show('table-users-spinner');
    this._accessService.getUsers(page)
      .subscribe({
        next: (data) => {
          this.spinner.hide('table-users-spinner');
          this.users = data;
          this.cdr.detectChanges();
          // console.log(this.users);
        },
        error: err => {
          console.log(err);
          this.spinner.hide('table-users-spinner');
          this.cdr.detectChanges();
        }
      });
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

  delete(login: string): void {
    this.modalService.open(NgbdModalConfirmComponent, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        if (result === 'confirm') {
          this.spinner.show();
          this._accessService.deleteUser(login)
            .subscribe({
              next: (data) => {
                this.spinner.hide();
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

  async getUserByLogin(login: string): Promise<AdminUserDTO> {
    const user$ = this._accessService.getUserByLogin(this.userLoginIn);
    return await lastValueFrom(user$);
  }

  onSubmit(): void {
    const values = this.createForm.getRawValue();
    //console.log(values);


    this.submitted = true;
    if (this.createForm.invalid) {
      this.toastr.warning('Existem campos a serem corrigidos', 'Atenção');
    } else {

      const authorities: string[] = [];
      const roles: AuthoritiesSelectAux[] | null = values.authorities;
      roles!.forEach(at => {
        authorities.push(at.id);
      });

      const newValues = JSON.parse(JSON.stringify(values));
      newValues.authorities = authorities;
      //console.log(newValues);

      this.spinner.show();
      this._accessService.postOrPutUser(newValues, this.statusForm)
        .subscribe({
          next: (data) => {
            this.spinner.hide();
            this.submitted = false;
            this.toastr.success('', (this.statusForm === 1 ? 'Adicionado com sucesso' : 'Alterado com sucesso'));
            this.onClear();
            this.cdr.detectChanges();
            this.getUsers();
          },
          error: err => {
            this.spinner.hide();
            console.log(err);
            this.toastr.error('Erro ao realizar requisição', 'Atenção');
          }
        });
    }

  }

  dtoToForm(user: AdminUserDTO): void {
    this.createForm.reset();

    const authorities: AuthoritiesSelectAux[] = [];
    if (user.authorities != null && user.authorities.length > 0) {
      user.authorities.forEach(auth => {
        const obj = {
          id: auth,
          name: this._authUtilsService.getRoleNameCut(auth),
        };
        authorities.push(obj);
      });
    }

    ///console.log(authorities);
    this.createForm.patchValue({
      id: user.id,
      login: user.login,
      firstName: user.firstName,
      lastName: user.lastName,
      createdBy: user.createdBy,
      activated: user.activated,
      createdDate: user.createdDate,
      email: user.email,
      imageUrl: user.imageUrl,
      langKey: user.langKey,
      lastModifiedBy: user.lastModifiedBy,
      lastModifiedDate: user.lastModifiedDate,
      disabled: user.disabled,
      singinByApp: user.singinByApp,
      singinByMSF: user.singinByMSF,
      organizations: user.organizations,
    });
    this.createForm.controls.authorities.setValue(authorities);
    this.createForm.controls.id.disable();
    this.statusForm = 2;
  }

  onClear(): void {
    this.createForm.reset();
    this.initForm();
    this.submitted = false;
    this.statusForm = 1;

    this.getAuthorities();
    this.getUsers();
    this.getOrganizations();
  }

  initForm(): void {
    this.createForm.patchValue({
      singinByApp: true,
      singinByMSF: true,
      disabled: false,
    });
    this.createForm.controls.id.disable();
  }
  get f() { return this.createForm.controls; }

  compareRoles(s1: AuthoritiesSelectAux, s2: AuthoritiesSelectAux): boolean {
    return s1 && s2 ? s1.id === s2.id : s1 === s2;
  }

  compareOrganizations(s1: Organization, s2: Organization): boolean {
    return s1 && s2 ? s1.id === s2.id : s1 === s2;
  }

  edit(login: string): void {
    const flt = this.users.filter(ur => {
      return ur.login === login;
    });
    if (flt.length > 0) {
      this.dtoToForm(flt[0]);
      this.cdr.detectChanges();
    } else {
      this.toastr.warning('Atualize a pagina para capturar as mudanças primeiro', 'Atenção');
    }
  }

  permitEditOrDelete(user: AdminUserDTO): boolean {
    if (user.id === 1 || user.id === 2) {
      return true;
    } else {
      return false;
    }
  }
}
