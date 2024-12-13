import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminUserDTO, AuthoritiesSelectAux, Organization } from '@modules/access/access.utils';
import { CustomizationsService } from '@modules/customizations/customizations.service';
import { SelectionType } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-menus',
  templateUrl: './menus.component.html',
  styleUrls: ['menus.component.scss'],
})
export class MenusComponent implements OnInit {

  submitted = false;
  statusForm = 1;
  userLoginIn!: string;
  roles: AuthoritiesSelectAux[] = [{ id: 'ROLE_ADMIN', name: 'ROLE_ADMIN' }, { id: 'ROLE_USER', name: 'ROLE_USER' }];
  SelectionTypeSingle = SelectionType.single;

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
    private _service: CustomizationsService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) { }
  ngOnInit(): void {
    console.log('iniciando');
    this.initForm();

    
  }



  onSubmit(): void {
    const values = this.createForm.getRawValue();
    

    this.submitted = true;
    if (this.createForm.invalid) {
      this.toastr.warning('Existem campos a serem corrigidos', 'Atenção');
    }

  }

  dtoToForm(user: AdminUserDTO): void {
    this.createForm.reset();

    const authorities: AuthoritiesSelectAux[] = [];
    if (user.authorities != null && user.authorities.length > 0) {
      user.authorities.forEach(auth => {
        const obj = {
          id: auth,
          name: auth
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
    this.createForm.controls.id.disable();
    this.statusForm = 2;
  }

  onClear(): void {
    this.createForm.reset();
    this.initForm();
    this.submitted = false;
    this.statusForm = 1;
  }

  initForm(): void {
    this.createForm.patchValue({
      authorities: [{ id: 'ROLE_USER', name: 'ROLE_USER' }],
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
}
