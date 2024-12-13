import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthUtilsService } from '@modules/auth-utils/auth-utils.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirmComponent } from '../utils/modal-confirm.component';
import { CustomizationsService } from '@modules/customizations/customizations.service';
import { GroupUser, MenuReport, PbiReportDTO, PbiWorkspaceDTO, SubMenuReport } from '@modules/customizations/customizations.utils';
import { AccessService } from '@modules/access/access.service';
import { Organization } from '@modules/access/access.utils';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-dash-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['reports.component.scss'],
})
export class ReportsComponent implements OnInit {

  submitted = false;
  submittedReport = false;
  statusForm = 1;
  organizations: Organization[] = [];
  groupUsers: GroupUser[] = [];
  groupUsersReport: GroupUser[] = [];
  groupUsersFiltered: GroupUser[] = [];
  @ViewChild(DatatableComponent) table!: DatatableComponent;
  ColumnMode = ColumnMode;
  workspaces: PbiWorkspaceDTO[] = [];
  reports: PbiReportDTO[] = [];
  submenus: SubMenuReport[] = [];
  menus: MenuReport[] =[];
  menusFiltered: MenuReport[] =[];
  searchingGroup = false;
  searchingReportPBI = false;
  SelectionTypeSingle = SelectionType.single;


  createForm = new FormGroup({
    id: new FormControl<number|null>(null),
    text: new FormControl<string|null>(null, [Validators.required, Validators.maxLength(255)]),
    icon: new FormControl<string|null>('bar-chart', [Validators.maxLength(255)]),
    groupUsers: new FormControl<GroupUser[]|null>(null, [Validators.required]),
    enableState: new FormControl<boolean|null>(null),
    organization: new FormControl<Organization|null>(null, [Validators.required]),
    orderView: new FormControl<number|null>(null),
  });

  reportForm = new FormGroup({
    workspace: new FormControl(null, [Validators.required]),
    text: new FormControl<string|null>(null, [Validators.required, Validators.maxLength(255)]),
    groupUsers: new FormControl(null, [Validators.required]),
    reportObj: new FormControl(null, [Validators.required]),
    orderView: new FormControl(null),
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
    this.getAllWorkspacesPbi();
    this.getAllMenuReportsByUser();
    this.cdr.markForCheck();
  }

  resertForm(): void {
    this.createForm.reset();
    this.createForm.controls.id.disable();
    this.createForm.controls.enableState.setValue(true);
    this.createForm.controls.icon.setValue('bar-chart');

    this.reportForm.reset();
  }

  formReportToSubMenuReport(): SubMenuReport {
    const rawValues: any = this.reportForm.getRawValue();
    const values: SubMenuReport = {
      pkid: null,
      text: rawValues.text,
      id: rawValues.reportObj.id,
      reportType: rawValues.reportObj.reportType,
      name: rawValues.reportObj.name,
      webUrl: rawValues.reportObj.webUrl,
      embedUrl: rawValues.reportObj.embedUrl,
      isFromPbix: rawValues.reportObj.isFromPbix,
      isOwnedByMe: rawValues.reportObj.isOwnedByMe,
      datasetId: rawValues.reportObj.datasetId,
      datasetWorkspaceId: rawValues.reportObj.datasetWorkspaceId,
      groupUsers: rawValues.groupUsers,
      userInclusion: null,
      userLastUpdate: null,
      dtaInclusion: null,
      dtaLastUpdate: null,
      workspace: rawValues.workspace,
      orderView: rawValues.orderView,
    };
    return values;
  }

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

  getFormValidationErrors() {
    Object.keys(this.createForm.controls).forEach(key => {

        const controlErrors: ValidationErrors | null = this.createForm.get(key)!.errors;
        if (controlErrors != null) {
            Object.keys(controlErrors).forEach(keyError => {
                console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
            });
        }
    });
}

  addReport(): void {
    this.submittedReport = true;
    const values = this.reportForm.getRawValue();
    console.log(values);
    if (this.reportForm.invalid) {
      this.toastr.warning('Existem campos a serem corrigidos', 'Atenção');
    } else {
      const newObj = this.formReportToSubMenuReport();
      const flt = this.submenus.filter(sb => {
        return sb.id === newObj.id;
      });
      if (flt.length > 0) {
        this.toastr.warning('Já existe um relátorio com esse mesmo ID', 'Atenção');
        this.cdr.markForCheck();
      } else {
        this.submenus.push(this.formReportToSubMenuReport());
        this.submenus = [...this.submenus];
        this.onClearReport();
        this.toastr.success('Adicionado com sucesso', '');
        this.cdr.markForCheck();
      }
    }
  }
  deleteReport(row: SubMenuReport): void {

    const activeModal = this.modalService.open(NgbdModalConfirmComponent, { ariaLabelledBy: 'modal-basic-title' });
    activeModal.result.then(
      (result) => {
        if (result === 'confirm') {

          for (let i = 0; i < this.submenus.length; i++) {
            if (this.submenus[i].id === row.id) {
              this.submenus.splice(i, 1);
            }
          }
          this.submenus = [...this.submenus];
          this.cdr.markForCheck();

          this.toastr.success('Removido com sucesso', '');

        }
      });
  }

  changeOrganization(): void {
    const organizationValue: any = this.createForm.controls.organization.value;
    if (organizationValue != null && typeof(organizationValue.id) !== 'undefined' && organizationValue.id > 0) {
      this.getAllActiveGroupsByOrganization(organizationValue.id);
    } else {
      this.groupUsers = [];
    }
    this.cdr.markForCheck();
  }

  changeReport(): void {
    const reportObj: any = this.reportForm.controls.reportObj.value;

    if (reportObj !== null && typeof (reportObj) !== 'undefined' && typeof (reportObj.name) !== 'undefined') {
      this.reportForm.patchValue({
        text: reportObj.name
      });
    }
    this.cdr.markForCheck();
  }



  onSubmit(): void {
    const values: any = this.createForm.getRawValue();
    this.submitted = true;

    if (this.createForm.invalid) {
      console.log(this.createForm.errors);
      this.toastr.warning('Existem campos a serem corrigidos', 'Atenção');
    } else {
      this.spinner.show('full-spinner');
      console.log(values);
      console.log(this.submenus);
      values.subMenuReports = this.submenus;
      
      this.customizationsService.postOrPutMenuReport(values, this.statusForm)
        .subscribe({
          next: (data) => {
            this.spinner.hide('full-spinner');
            let messageSuccess = '';
            if (this.statusForm === 1) {
              messageSuccess = 'Cadastrado com sucesso';
            } else {
              messageSuccess = 'Alterado com sucesso';
            }
            this.toastr.success(messageSuccess, 'OK');
            this.submitted = false;
            this.submenus = [];
            this.resertForm();
            this.statusForm = 1;
            this.getAllMenuReportsByUser();
            this.cdr.markForCheck();
          },
          error: (err) => {
            this.spinner.hide('full-spinner');
            this.cdr.markForCheck();
            this.toastr.error('Erro ao cadastrar relatório', 'ERROR');
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

  getAllMenuReportsByUser(): void {
    this.customizationsService.getAllMenuReportsByUser()
      .subscribe({
        next: (data) => {
          this.spinner.hide('search-spinner');
          this.menus = [...data];
          this.menusFiltered = [...this.menus];
          this.cdr.markForCheck();
          console.log(this.menus);
        },
        error: (err) => {
          this.spinner.hide('search-spinner');
          this.cdr.markForCheck();
          this.toastr.error('Erro ao buscar os relatórios', 'ERROR');
        }
      });
  }

  getAllWorkspacesPbi(): void {
    this.customizationsService.getAllWorkspacesPbi()
      .subscribe({
        next: (data) => {
          if (data !== null && typeof (data.value) !== 'undefined' && data.value !== null && data.value.length > 0) {
            this.workspaces = [...data.value];
            this.cdr.markForCheck();
          }
        },
        error: (err) => {
          this.toastr.error('Erro ao buscar workspaces', 'ERROR');
        }
      });
  }

  onClear(): void {
    this.resertForm();
    this.submitted = false;
    this.statusForm = 1;
    this.searchingGroup = false;
    this.searchingReportPBI = false;
    this.submenus = [];
    this.groupUsersReport = [];
    this.reports = [];
    this.getAllEnableOrganizationByUser();
    this.getAllWorkspacesPbi();
    this.getAllMenuReportsByUser();
    this.cdr.markForCheck();
  }

  getAllActiveGroupsByOrganization(organizationId: number): void {
    this.searchingGroup = true;
    this.customizationsService.getAllActiveGroupsByOrganization(organizationId)
      .subscribe({
        next: (data) => {
          this.searchingGroup = false;
          console.log(data);

          if (data != null && data.length > 0) {
            this.groupUsers = [...data];
            this.groupUsersFiltered = [...this.groupUsers];
          }

          this.changeGroups();
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.searchingGroup = false;
          console.log(err);
          this.toastr.error('Erro ao pesquisar grupos, contate o administrador', 'Atenção');
          this.cdr.markForCheck();
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
          this.cdr.markForCheck();
        }
      });
  }

  get f() { return this.createForm.controls; }
  get r() { return this.reportForm.controls; }
  

  changeGroups(): void {
    const values: any = this.createForm.controls.groupUsers.value;
    if (values != null && typeof(values) !== 'undefined' && values.length > 0) {
      this.groupUsersReport = [...values];
      this.reportForm.controls.groupUsers.setValue(null);
    } else {
      this.groupUsersReport = [];
      this.reportForm.controls.groupUsers.setValue(null);
    }
    this.cdr.markForCheck();
  }

  alterWorkspace(): void {
    const workspace: any = this.reportForm.controls.workspace.value;
    if (workspace !== null && typeof (workspace.id) !== 'undefined' && workspace.id != null) {
      this.getReportsByWorkspaceId(workspace.id);
    }
  }


  onClearReport(): void {
    this.reportForm.reset();
    this.submenus = [...this.submenus];
    this.submittedReport = false;
  }

  getReportsByWorkspaceId(workspaceId: string): void {
    this.searchingReportPBI = true;
    this.customizationsService.getAllReporstPbiByWorkspaceId(workspaceId)
      .subscribe({
        next: (data) => {
          this.searchingReportPBI = false;
          this.reports = [...data.value];
          this.toastr.success('Relatórios encontrados','');
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.searchingReportPBI = false;
          this.toastr.error('Erro ao pesquisar relatorios, contate o administrador', 'Atenção');
          this.cdr.markForCheck();
        }
      });
  }

  compareOrganization(s1: Organization, s2: Organization): boolean {
    return s1 && s2 ? s1.id === s2.id : s1 === s2;
  }

  compareRelatorio(s1: Organization, s2: Organization): boolean {
    return s1 && s2 ? s1.id === s2.id : s1 === s2;
  }

  compareWorkspace(s1: Organization, s2: Organization): boolean {
    return s1 && s2 ? s1.id === s2.id : s1 === s2;
  }

  compareGrupos(s1: GroupUser, s2: GroupUser): boolean {
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

  editMenu(row: MenuReport): void {
    this.createForm.patchValue({
      id: row.id,
      text: row.text,
      icon: row.icon,
      enableState: row.enableState,
      organization: row.organization,
      groupUsers: row.groupUsers,
      orderView: row.orderView
    });

    this.submenus = row.subMenuReports;

    this.statusForm = 2;
    this.cdr.markForCheck();
    this.changeOrganization();
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

  filterMenuName(event: any) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.menus.filter(function (d) {
      return d.text.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // update the rows
    this.menusFiltered = [...temp];
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }


  delete(groupUser: GroupUser): void {
    const activeModal = this.modalService.open(NgbdModalConfirmComponent, { ariaLabelledBy: 'modal-basic-title' });
    activeModal.result.then(
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
         
                this.cdr.markForCheck();
              },
              error: err => {
                this.spinner.hide();
                console.log(err);
                this.toastr.error('Erro ao deletar, contate o administrador', 'Atenção');
              }
            });
        }
      }
    );
  }

  deleteMenu(row: MenuReport): void {
    const activeModal = this.modalService.open(NgbdModalConfirmComponent, { ariaLabelledBy: 'modal-basic-title' });
    activeModal.result.then(
      (result) => {
        if (result === 'confirm') {
          this.spinner.show('search-spinner');
          this.customizationsService.deleteMenuReportById(row.id)
            .subscribe({
              next: (data) => {
                this.spinner.hide();
                this.submitted = false;
                this.getAllMenuReportsByUser();
                this.toastr.success('Deletado com sucesso', 'OK');
                this.cdr.markForCheck();
              },
              error: err => {
                this.spinner.hide();
                console.log(err);
                this.toastr.error('Erro ao deletar, contate o administrador', 'Atenção');
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
