import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthUtilsService } from '@modules/auth-utils/auth-utils.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from '../utils/modal-confirm.component';
import { CustomizationsService } from '@modules/customizations/customizations.service';
import { GroupUser } from '@modules/customizations/customizations.utils';
import { AccessService } from '@modules/access/access.service';
import { Organization } from '@modules/access/access.utils';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { errors } from '@modules/pages/services-utils/error.codes';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['groups.component.scss'],
})
export class GroupsComponent implements OnInit {

  submitted = false;
  statusForm = 1;
  organizations: Organization[] = [];
  groupUsers: GroupUser[] = [];
  groupUsersFiltered: GroupUser[] = [];
  @ViewChild(DatatableComponent) table!: DatatableComponent;
  ColumnMode = ColumnMode;
  SelectionTypeSingle = SelectionType.single;

  createForm = new FormGroup({
    id: new FormControl<number|null>(null),
    name: new FormControl<string|null>(null, [Validators.required, Validators.maxLength(255)]),
    description: new FormControl<string|null>(null, [Validators.maxLength(255)]),
    enableState: new FormControl<boolean|null>(null),
    organization: new FormControl<Organization|null>(null, [Validators.required]),
  });

  constructor(
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private cdr: ChangeDetectorRef,
    private _authUtilsService: AuthUtilsService,
    private modalService: NgbModal,
    private customizationsService: CustomizationsService,
    private accessService: AccessService,
  ) { }

  ngOnInit(): void {
    console.log('iniciando');
    this.resertForm();
    this.getAllEnableOrganizationByUser();
    this.getAllGroups();
    this.cdr.markForCheck();
  }

  resertForm(): void {
    this.createForm.reset();
    this.createForm.controls.id.disable();
    this.createForm.controls.enableState.setValue(true);
  }

  onSubmit(): void {
    const values: any = this.createForm.getRawValue();
    this.submitted = true;
    if (this.createForm.invalid) {
      this.toastr.warning('Existem campos a serem corrigidos', 'Atenção');
    } else {
      this.spinner.show();
      this.customizationsService.postOrPutGroup(values, this.statusForm)
        .subscribe({
          next: (data) => {
            this.spinner.hide();
            let messageSuccess = '';
            if (this.statusForm === 1) {
              messageSuccess = 'Cadastrado com sucesso';
            } else {
              messageSuccess = 'Alterado com sucesso';
            }
            this.toastr.success(messageSuccess, 'OK');
            this.submitted = false;
            this.resertForm();
            this.statusForm = 1;
            this.getAllGroups();
            this.cdr.markForCheck();
          },
          error: (err) => {
            this.spinner.hide();
            this.cdr.markForCheck();
            this.toastr.error('Erro ao cadastrar empresa', 'ERROR');
          }
        });

    }
  }

  permitEditOrDelete(groupUser: GroupUser): boolean {
    if (groupUser.id === 1) {
      return true;
    } else {
      return false;
    }
  }

  getAllEnableOrganizationByUser(): void {
    this.accessService.getAllEnableOrganizationByUser()
      .subscribe({
        next: (data) => {
          this.spinner.hide();
          this.organizations = [...data];
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.spinner.hide();
          this.cdr.markForCheck();
          this.toastr.error('Erro ao buscar organizações', 'ERROR');
        }
      });
  }

  onClear(): void {
    this.resertForm();
    this.submitted = false;
    this.statusForm = 1;
    this.getAllGroups();
    this.getAllEnableOrganizationByUser();
    this.cdr.markForCheck();
  }

  getAllGroups(): void {
    this.spinner.show('search-spinner');
    this.customizationsService.getAllActiveGroupsByUser()
      .subscribe({
        next: (data) => {
          this.spinner.hide('search-spinner');
          console.log(data);

          if (data != null && data.length > 0) {
            this.groupUsers = [...data];
            this.groupUsersFiltered = [...this.groupUsers];
          }

          this.cdr.markForCheck();
        },
        error: (err) => {
          this.spinner.hide('search-spinner');
          console.log(err);
          this.toastr.error('Erro ao pesquisar grupos, contate o administrador', 'Atenção');
        }
      });
  }

  onPesquisa(): void {
    const groupUser = this.createForm.getRawValue();
    console.log(groupUser);
    this.spinner.show();
    this.customizationsService.searchGroup(groupUser)
      .subscribe({
        next: (data) => {
          this.spinner.hide();
          console.log(data);

          if (data != null && data.length === 0) {
            this.toastr.warning('Não foi encontrado resultados na pesquisa', 'Atenção');
          } else if (data != null && data.length > 0) {
            this.statusForm = 3;
            this.groupUsers = [...data];
          } else {
            this.toastr.warning('Não foi encontrado resultados na pesquisa', 'Atenção');
          }

          this.cdr.markForCheck();
        },
        error: (err) => {
          this.spinner.hide();
          console.log(err);
          this.toastr.error('Erro ao pesquisar grupos, contate o administrador', 'Atenção');
        }
      });
  }

  get f() { return this.createForm.controls; }

  compareCompanies(s1: Organization, s2: Organization): boolean {
    return s1 && s2 ? s1.id === s2.id : s1 === s2;
  }

  voltar(): void {
    const id = this.createForm.controls.id.value;
    if (id != null && id > 0) {
      this.statusForm = 2;
    } else {
      this.statusForm = 1;
    }
    this.cdr.markForCheck();
  }

  edit(groupUser: GroupUser): void {
    this.createForm.patchValue({
      id: groupUser.id,
      name: groupUser.name,
      description: groupUser.description,
      enableState: groupUser.enableState,
      organization: groupUser.organization,
    });
    this.statusForm = 2;
    this.cdr.markForCheck();
  }

  removeById(id: number): void {
    for (let i = 0; i < this.groupUsers.length; i++) {
      if (this.groupUsers[i].id === id) {
        this.groupUsers.splice(i, 1);
      }
    }
    this.groupUsers = [...this.groupUsers];
    this.cdr.markForCheck();
  }

  filterGroupName(event: any) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.groupUsers.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // update the rows
    this.groupUsersFiltered = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }


  delete(groupUser: GroupUser): void {
    this.modalService.open(NgbdModalConfirmComponent, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        if (result === 'confirm') {
          this.spinner.show();
          this.customizationsService.deleteGroupById(groupUser.id)
            .subscribe({
              next: (data) => {
                this.spinner.hide();
                this.submitted = false;
                // this.removeById(groupUser.id);
                this.toastr.success('Deletado com sucesso', 'OK');
                this.getAllGroups();
                this.cdr.markForCheck();
              },
              error: err => {
                this.spinner.hide();
                console.log(err);
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
                  this.toastr.error('Erro ao deletar, contate o administrador', 'Atenção');
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
