import { Component, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FluxoCaixaTipoDTO } from '@modules/shared/models/fluxo-caixa';
import { GenericPesquisaDTO, PageGeneric } from '@modules/shared/models/generic';
import { FluxoService } from '@modules/shared/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AppFluxoAlertModalAlertComponent } from '../modal-alert/app-alert-modal-alert.component';
import { AppFluxoModalConfirmComponent } from '../modal-confirm/app-fluxo-modal-confirm.component';

@Component({
  selector: 'app-fluxos-fluxo-tipo',
  templateUrl: './fluxo-tipo.component.html',
  styleUrls: ['fluxo-tipo.component.scss'],
})
export class FluxoTipoComponent implements AfterViewInit {
  @ViewChild('nomeDTOForm') nomeDTOForm: ElementRef | undefined;
  ColumnMode = ColumnMode;
  statusForm = 1;
  selectionTypeSingle = SelectionType.single;
  submitted = false;
  page!: PageGeneric<FluxoCaixaTipoDTO> | null;
  pesquisa!: GenericPesquisaDTO<FluxoCaixaTipoDTO>;
  pageSize = 20;

  selected: any[] = [];

  rowTableGeneric = [];

  createForm = new FormGroup({
    id: new FormControl<number | null>(null),
    nome: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(255)]),
    descricao: new FormControl<string | null>(null, [Validators.maxLength(4000)]),
    status: new FormControl<boolean | null>(null, [Validators.required]),
    dtaInclusao: new FormControl<string | null>(null),
    dtaUltAlteracao: new FormControl<string | null>(null),
    usuarioInclusao: new FormControl<string | null>(null),
    usuarioUltAlteracao: new FormControl<string | null>(null),
    tipo: new FormControl<string | null>(null, [Validators.required]),
  });

  constructor(
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private _modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private fluxoService: FluxoService,
  ) { }

  disableFormFields(): void {
    this.createForm.get('dtaInclusao')?.disable();
    this.createForm.get('dtaUltAlteracao')?.disable();
    this.createForm.get('usuarioInclusao')?.disable();
    this.createForm.get('usuarioUltAlteracao')?.disable();
  }

  ngAfterViewInit() {
    this.nomeDTOForm!.nativeElement.focus();
    this.disableFormFields();
  }

  onSubmit(): void {
    this.submitted = true;
    this.createForm.patchValue({
      dtaInclusao: null,
      dtaUltAlteracao: null
    });
    const values = this.createForm.getRawValue();
    console.log(values);
    if (this.createForm.invalid) {
      this.toastr.warning('Corrija os campos faltantes', '');
    } else {
      this.spinner.show('fullSpinner');
      this.fluxoService.postOrPutFuxoTipo(values, this.statusForm)
        .subscribe({
          next: (data) => {
            this.dtoToForm(data);
            this.statusForm = 2;
            this.spinner.hide('fullSpinner');
            this.page = null;
            this.createForm.controls['id'].disable();
            this.cdr.markForCheck();
          },
          error: (error) => {
            this.spinner.hide('fullSpinner');
            console.error(error);
            this.toastr.error('Erro ao salvar', '');
          },
        });
    }
  }
  onLimpa(): void {
    this.createForm.reset();
    this.createForm.get('id')?.setValue(null);
    this.createForm.get('tipo')?.setValue(null);
    this.createForm.get('status')?.setValue(null);

    this.page = null;

    this.disableFormFields();
    this.createForm.controls['id'].enable();
    this.submitted = false;
    this.statusForm = 1;
    this.cdr.detectChanges();
  }

  get f() { return this.createForm.controls; }
  onLeftArray(): void {
    if (this.statusForm === 2) {
      for (let i = 0; i < this.page!.content.length; i++) {
        const id = this.createForm.controls['id'].value;
        if (id != null && !isNaN(id) && id === this.page!.content[i].id) {
          if ((i - 1) >= 0) {
            this.selected = [];
            this.dtoToForm(this.page!.content[i - 1]);
            this.selected.push(this.page!.content[i - 1]);
            i = this.page!.content.length + 1;
          } else {
            this.toastr.error('Sem registro para mover, busque novamente ou pule a página', '');
          }
        }
      }
    }
  }
  onRightArray(): void {
    if (this.statusForm === 2) {
      for (let i = 0; i < this.page!.content.length; i++) {
        const id = this.createForm.controls['id'].value;
        if (id != null && !isNaN(id) && id === this.page!.content[i].id) {
          if ((i + 1) < this.page!.content.length) {
            this.selected = [];
            this.dtoToForm(this.page!.content[i + 1]);
            this.selected.push(this.page!.content[i + 1]);
            i = this.page!.content.length + 1;
          } else {
            this.toastr.error('Sem registro para mover, busque novamente ou pule a página', '');
          }
        }
      }
    }
  }

  onTable(): void {
    this.unsetSelected();
    if (this.page != null && this.page!.content.length > 0) {
      this.statusForm = 3;
    } else {
      this.toastr.error('Procure primeiro', '');
    }
    this.cdr.detectChanges();
  }

  unsetSelected(): void {
    if (this.selected != null) {
      this.selected.splice(0, this.selected.length);
    }
  }

  onDeleta(): void {
    const id = this.createForm.controls.id.value;
    if (id != null && !isNaN(id) && id > 0 && this.statusForm === 2) {
      const activeModal = this._modalService.open(AppFluxoModalConfirmComponent);
      activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
      activeModal.componentInstance.modalContent = 'Deseja realmente excluir ?';
      activeModal.componentInstance.modalType = 'confirm';
      activeModal.componentInstance.defaultLabel = 'Não';
      activeModal.result.then((result) => {
        if (result === 'confirm') {
          this.spinner.show('fullSpinner');
          let message = '';
          this.fluxoService.delFluxoTipo(id)
            .subscribe({
              next: async (resp: any) => {
                this.spinner.hide('fullSpinner');
                message = resp.message;
                this.toastr.success(message, '');
                await this.delay(1000);
                this.onLimpa();
                this.cdr.detectChanges();
              },
              error: (err) => {
                this.spinner.hide('fullSpinner');
                message = err.message;
                this.toastr.error(message, '');
                this.cdr.detectChanges();
              }
            });
        }
      }, (error) => { console.log(error) });
    } else {
      this.msgAlerta('Atenção', `Selecione um objeto primeiro,
        não é possível deletar sem um id válido`, 'alert');
    }
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  msgAlerta(titulo: string, conteudo: string, tipo: string): void {
    const activeModal = this._modalService.open(
      AppFluxoAlertModalAlertComponent, { backdrop: true });
    activeModal.componentInstance.modalHeader = titulo;
    activeModal.componentInstance.modalContent = conteudo;
    activeModal.componentInstance.modalType = tipo;
    activeModal.result.then((result) => { console.log(result) }, (error) => { console.log(error) });
  }

  onPesquisa(): void {
    const rawValue = this.createForm.getRawValue();
    const searchObj: GenericPesquisaDTO<FluxoCaixaTipoDTO> = {
      object: rawValue,
      pageNumber: 0,
      pageSize: this.pageSize,
      dtaInicialPesquisa: null,
      dtaFinalPesquisa: null,
      dtaReferenciaInicial: null,
      dtaReferenciaFinal: null,
      usuarioInclusao: null,
      valorInicial: null,
      valorFinal: null,
    };
    this.onPesquisaItem(searchObj);
  }

  setPage(pageInfo: any) {
    const rawValue = this.createForm.getRawValue();
    const searchObj: GenericPesquisaDTO<FluxoCaixaTipoDTO> = {
      object: rawValue,
      pageNumber: pageInfo.offset,
      pageSize: pageInfo.pageSize,
      dtaInicialPesquisa: null,
      dtaFinalPesquisa: null,
      dtaReferenciaInicial: null,
      dtaReferenciaFinal: null,
      usuarioInclusao: null,
      valorInicial: null,
      valorFinal: null,
    };
    this.onPesquisaItem(searchObj);
  }

  onPesquisaItem(itemPesqDTO: any): void {
    this.spinner.show('fullSpinner');
    this.fluxoService.findFluxoItem(itemPesqDTO)
      .subscribe({
        next: (data) => {
          this.spinner.hide('fullSpinner');
          console.log(data);
          const pageData = data;

          this.page = pageData;


          if (this.page!.content.length === 0) {
            this.toastr.error('Nenhum registro encontrado', '');
          } else {
            // console.log('mais que 1');
            this.statusForm = 3;
          }
          this.cdr.markForCheck();
        },
        error: () => {
          this.spinner.hide('fullSpinner');
          this.cdr.markForCheck();
        }
      });
  }

  voltar(): void {
    const id = this.createForm.controls.id.value;
    if (id != null && !isNaN(id) && id > 0) {
      this.statusForm = 2;
    } else {
      this.statusForm = 1;
    }
    this.cdr.markForCheck();
  }
  editando(): void {
    this.spinner.show('fullSpinner');
    const sel = this.page!.content.filter(us => {
      return us.id === this.selected[0].id;
    });
    this.dtoToForm(sel[0]);
    this.createForm.controls['id'].disable();
    this.statusForm = 2;
    this.spinner.hide('fullSpinner');
    this.cdr.markForCheck();
  }
  onActivate(event: any): void {
    if (
      (event.type === 'dblclick') ||
      (event.type === 'keydown' && event.event.keyCode === 13)
    ) {
      this.editando();
    }
  }

  dtoToForm(dto: FluxoCaixaTipoDTO): void {
    this.createForm.get('id')?.setValue(dto.id);
    this.createForm.get('nome')?.setValue(dto.nome);
    this.createForm.get('descricao')?.setValue(dto.descricao);
    this.createForm.get('status')?.setValue(dto.status);
    this.createForm.get('dtaInclusao')?.setValue(this.toDateField(dto.dtaInclusao));
    this.createForm.get('dtaUltAlteracao')?.setValue(this.toDateField(dto.dtaUltAlteracao));
    this.createForm.get('usuarioInclusao')?.setValue(dto.usuarioInclusao);
    this.createForm.get('usuarioUltAlteracao')?.setValue(dto.usuarioUltAlteracao);
    this.createForm.get('tipo')?.setValue(dto.tipo);
  }


  compareGeneric(c1: any, c2: any): boolean {
    return c1 === c2;
  }
  compareGenericWithBoleanStatus(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.status === c2.status : c1 === c2;
  }

  toDateField(isoDate: string | null): string {
    const date = new Date(isoDate!);
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    return date!.toLocaleString('pt-BR', options).replace(',', '');
  }

}