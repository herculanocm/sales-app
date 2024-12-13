import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthUtilsService } from '@modules/auth-utils/auth-utils.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { KeyValueConfig } from '../../access.utils';
import { AccessService } from '@modules/access/access.service';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { NgbdModalConfirmComponent } from '../util/modal-confirm.component';

@Component({
  selector: 'app-key-value-config',
  templateUrl: './key-value-config.component.html',
  styleUrls: ['key-value-config.component.scss'],
})
export class KeyValueConfigComponent implements OnInit {

  submitted = false;
  statusForm = 1;
  configs: KeyValueConfig[] = [];
  @ViewChild(DatatableComponent) table!: DatatableComponent;
  ColumnMode = ColumnMode;
  SelectionTypeSingle = SelectionType.single;

  configForm = new FormGroup({
    keyString: new FormControl<string|null>(null, [Validators.required, Validators.maxLength(255)]),
    valueString: new FormControl<string|null>(null, [Validators.required, Validators.maxLength(255)]),
    description: new FormControl<string|null>(null),
    encrypted: new FormControl(false),
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

    this.getAllConfigs();
  }

  onSubmit(): void {
    const values = this.configForm.getRawValue();
    this.submitted = true;
    if (this.configForm.invalid) {
      this.toastr.warning('Existem campos a serem corrigidos', 'Atenção');
    } else {
      this.spinner.show('fullSpinner');

      console.log(values);
      this.accessService.postOrPutKeyValueConfig(values, this.statusForm)
        .subscribe({
          next: (data) => {
            this.spinner.hide('fullSpinner');
            let messageSuccess = '';

            messageSuccess = 'Realizado com sucesso';

            this.toastr.success(messageSuccess, 'OK');
            this.submitted = false;
            this.resertForm();
            this.statusForm = 1;
            this.getAllConfigs();
          },
          error: (err) => {
            this.spinner.hide('fullSpinner');
            this.cdr.markForCheck();
            this.toastr.error('Erro ao cadastrar empresa', 'ERROR');
          }
        });
    }
  }

  getAllConfigs(): void {
    this.spinner.show('searchSpinner');
    this.accessService.getAllConfigs()
      .subscribe({
        next: (data) => {
          this.spinner.hide('searchSpinner');
          this.configs = [...data];
          this.cdr.markForCheck();
          console.log(this.configs);
        },
        error: (err) => {
          this.spinner.hide('searchSpinner');
          this.cdr.markForCheck();
          this.toastr.error('Erro ao buscar configurações', 'ERROR');
        }
      });
  }

  onClear(): void {
    this.resertForm();
    this.submitted = false;
    this.statusForm = 1;
    this.getAllConfigs();
    this.cdr.markForCheck();
  }

  resertForm(): void {
    this.configForm.reset();
    this.configForm.enable();
    this.configForm.patchValue({
      encrypted: false,
    });
  }
  get f() { return this.configForm.controls; }

  dtoToForm(row: KeyValueConfig): void {
    this.configForm.patchValue({
      keyString: row.keyString,
      valueString: row.valueString,
      description: row.description,
      encrypted: row.encrypted
    });
  }

  edit(row: KeyValueConfig): void {
    this.statusForm = 2;
    this.dtoToForm(row);
    this.configForm.controls.keyString.disable();
    this.cdr.markForCheck();
  }

  delete(row: KeyValueConfig): void {
    this.modalService.open(NgbdModalConfirmComponent, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        if (result === 'confirm') {
          this.spinner.show('fullSpinner');
          this.spinner.show('searchSpinner');
          this.accessService.deleteConfigByKey(row.keyString)
            .subscribe({
              next: (data) => {
                this.spinner.hide('fullSpinner');
                this.submitted = false;
                this.toastr.success('Deletado com sucesso', 'OK');
                this.getAllConfigs();
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
