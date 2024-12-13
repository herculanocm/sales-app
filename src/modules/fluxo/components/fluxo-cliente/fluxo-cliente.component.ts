import { Component, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ClienteFluxoCaixaDTO, FluxoCaixaCentroDTO, FluxoCaixaTipoDTO } from '@modules/shared/models/fluxo-caixa';
import { CurrentUserSalesAppAux, GenericPesquisaDTO, PageGeneric } from '@modules/shared/models/generic';
import { ClienteService, CondicaoPagamentoService, FluxoService } from '@modules/shared/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AppFluxoAlertModalAlertComponent } from '../modal-alert/app-alert-modal-alert.component';
import { AppFluxoModalConfirmComponent } from '../modal-confirm/app-fluxo-modal-confirm.component';
import { CondicaoPagamentoDTO } from '@modules/shared/models/condicao-pagamento';
import { ClienteDTO } from '@modules/shared/models/cliente';
import { catchError, debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { ClienteVendasModalAlertComponent } from '../cliente-vendas/cliente-vendas.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fluxos-fluxo-cliente',
  templateUrl: './fluxo-cliente.component.html',
  styleUrls: ['fluxo-cliente.component.scss'],
})
export class FluxoClienteComponent implements OnInit, AfterViewInit {
  @ViewChild('dataRefForm') dataRefForm: ElementRef | undefined;
  ColumnMode = ColumnMode;
  statusForm = 1;
  selectionTypeSingle = SelectionType.single;
  submitted = false;
  page!: PageGeneric<ClienteFluxoCaixaDTO> | null;
  pesquisa!: GenericPesquisaDTO<ClienteFluxoCaixaDTO>;
  pageSize = 20;
  fluxoCaixaTipos: FluxoCaixaTipoDTO[] = [];
  fluxoCaixaCentros: FluxoCaixaCentroDTO[] = [];
  fluxoCaixaTiposFilter: FluxoCaixaTipoDTO[] = [];
  condicoes: CondicaoPagamentoDTO[] = [];
  currentUserSalesApp: CurrentUserSalesAppAux = JSON.parse(
    sessionStorage.getItem('currentUserSalesApp')!
  );


  selected: any[] = [];

  rowTableGeneric = [];

  createForm = new FormGroup({
    id: new FormControl<number | null>(null),
    vendaId: new FormControl<number | null>(null),
    clienteId: new FormControl<number | null>(null),
    valor: new FormControl<number | null>(0, [Validators.required, Validators.min(1)]),
    dtaReferencia: new FormControl<Date | null>(null, [Validators.required]),
    descricao: new FormControl<string | null>(null, [Validators.maxLength(4000)]),
    dtaInclusao: new FormControl<string | null>(null),
    dtaUltAlteracao: new FormControl<string | null>(null),
    usuarioInclusao: new FormControl<string | null>(null),
    usuarioUltAlteracao: new FormControl<string | null>(null),
    clienteDTO: new FormControl<ClienteDTO | null>(null, [Validators.required]),
    tipo: new FormControl<string | null>(null),
    fluxoCaixaTipoDTO: new FormControl<FluxoCaixaTipoDTO | null>(null, [Validators.required]),
    fluxoCaixaCentroDTO: new FormControl<FluxoCaixaCentroDTO | null>(null, [Validators.required]),
    condicaoPagamentoDTO: new FormControl<CondicaoPagamentoDTO | null>(null, [Validators.required]),

    dtaInicialPesquisa: new FormControl<Date | null>(null),
    dtaFinalPesquisa: new FormControl<Date | null>(null),
    dtaReferenciaInicial: new FormControl<Date | null>(null),
    dtaReferenciaFinal: new FormControl<Date | null>(null),
    valorInicial: new FormControl<number | null>(null),
    valorFinal: new FormControl<number | null>(null),

    usuarioInclu: new FormControl<string | null>(null),
  });

  flgPesquisandoCliente = 0;

  // typeahead
  searchingCliente!: boolean;
  searchFailedCliente!: boolean;

  searchingEmissor!: boolean;
  searchFailedEmissor!: boolean;
  // typeahead


  /* formatter */
  formatterCliente = (x: { nome: string }) => x.nome;
  /* formatter */


  /* Serach Observable */
  searchCliente = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(() => {
        this.searchingCliente = true;
      }),
      switchMap(term =>
        this._clienteService.nodejsFindByName(term)
          .pipe(
            tap(() => this.searchFailedCliente = false),
            catchError(() => {
              this.searchFailedCliente = true;
              return of([]);
            })),
      ), tap(() => {
        this.searchingCliente = false;
      }))

  constructor(
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private _modalService: NgbModal,
    private router: Router,
    private spinner: NgxSpinnerService,
    private fluxoService: FluxoService,
    private condicaoService: CondicaoPagamentoService,
    private _clienteService: ClienteService,
  ) { }

  ngOnInit(): void {
    this.initDefaults();
  }

  initDefaults(): void {
    this.loadTipos();
    this.loadCentros();
    this.loadCondicoes();
  }

  disableFormFields(): void {
    this.createForm.get('dtaInclusao')?.disable();
    this.createForm.get('dtaUltAlteracao')?.disable();
    this.createForm.get('usuarioInclusao')?.disable();
    this.createForm.get('usuarioUltAlteracao')?.disable();
  }

  ngAfterViewInit() {
    this.dataRefForm!.nativeElement.focus();
    this.disableFormFields();
  }

  onPesquisaPreVenda(): void {
    const prevendaId = this.createForm.controls['vendaId'].value;
    if (prevendaId != null && typeof (prevendaId) != 'undefined' && prevendaId > 0) {
      this.fluxoService.findVendaAux(prevendaId)
        .subscribe({
          next: (data) => {
            this.createForm.patchValue({
              vendaId: data.id,
              valor: data.vlrTotal,
              condicaoPagamentoDTO: data.condicaoPagamentoDTO,
              dtaReferencia: data.dtaEmissao,
            });
            this.cdr.markForCheck();
            this.toastr.success('Econtrado com sucesso', '');
          },
          error: (err) => {
            console.log(err);
            this.toastr.error('Erro ao buscar venda', '');
          }
        });
    }
  }

  changeTipo(): void {
    const tipo = this.createForm.controls['tipo'].value;
    if (tipo != null && typeof (tipo) != 'undefined' && tipo.length > 0) {
      this.fluxoCaixaTiposFilter = this.fluxoCaixaTipos.filter(f => {
        return f.tipo === tipo;
      });
    } else {
      this.fluxoCaixaTiposFilter = [];
    }
  }

  openClienteVendas(): void {
    const clienteId = this.createForm.controls['clienteId'].value;

    if (clienteId == null || isNaN(clienteId)) {
      this.toastr.error('É necessário selecionar um cliente', '');
    } else {
      const activeModal = this._modalService.open(
        ClienteVendasModalAlertComponent, { 
          backdrop: 'static',
          size: 'xl',
         });
      activeModal.componentInstance.modalHeader = 'Vendas do Cliente';
      activeModal.componentInstance.clienteId = clienteId;
      activeModal.result.then((result) => {
        if (result != null) {
          this.createForm.controls['vendaId'].setValue(result.id);
          this.createForm.controls['valor'].setValue(result.vlrTotal);
          this.createForm.controls['condicaoPagamentoDTO'].setValue(result.condicaoPagamentoDTO);
          this.createForm.controls['dtaReferencia'].setValue(result.dtaEmissao);
          this.cdr.detectChanges();
        }
      }, (error) => { console.log(error) });
    }
  }

  loadTipos(): void {
    this.fluxoService.getAllFluxoItemActive()
      .subscribe({
        next: (data) => {
          this.fluxoCaixaTipos = [...data];
          this.fluxoCaixaTipos.sort((obj1, obj2) => {
            if (obj1.nome! > obj2.nome!) {
              return 1;
            }
            if (obj1.nome! < obj2.nome!) {
              return -1;
            }
            return 0;
          });
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.log(err);
          this.toastr.error('Erro ao buscar os tipos', '');
        }
      });
  }

  loadCondicoes(): void {
    this.condicaoService.getAllActive()
      .subscribe({
        next: (data) => {
          this.condicoes = [...data];
          this.condicoes.sort((obj1, obj2) => {
            if (obj1.nome > obj2.nome) {
              return 1;
            }
            if (obj1.nome < obj2.nome) {
              return -1;
            }
            return 0;
          });

          this.cdr.markForCheck();
        },
        error: (err) => {
          console.log(err);
          this.toastr.error('Erro ao buscar as condições', '');
        }
      });
  }

  findClienteById(): void {
    const idCliente = this.createForm.controls.clienteId.value;

    if (idCliente == null || isNaN(idCliente)) {
      this.toastr.error('Digite um id valido para pesquisa', '');
    } else {

        this.selectClienteByCod(idCliente);
        this.cdr.detectChanges();
    }
    this.cdr.detectChanges();
}

selectClienteByCod(id: number): void {
  this.flgPesquisandoCliente = 1;
  this._clienteService.findById(id)
      .subscribe({
          next: (data) => {
              // console.log(data);
              this.setaModelAndFormCliente(data);
              this.toastr.success('Cliente encontrado com sucesso', '');
              this.flgPesquisandoCliente = 0;
              this.cdr.detectChanges();
          },
          error: () => {
              this.flgPesquisandoCliente = 0;
              this.toastr.error('Não foi encontrado cliente com esse codigo', '');
              this.cdr.detectChanges();
          }
      });
}

 setaModelAndFormCliente(cliente: ClienteDTO): void {
        this.createForm.patchValue({
            clienteDTO: cliente,
            clienteId: cliente.id,
        });
    }

  loadCentros(): void {
    this.fluxoService.getAllFluxoCentroActive()
      .subscribe({
        next: (data) => {
          this.fluxoCaixaCentros = [...data];
          this.fluxoCaixaCentros.sort((obj1, obj2) => {
            if (obj1.nome! > obj2.nome!) {
              return 1;
            }
            if (obj1.nome! < obj2.nome!) {
              return -1;
            }
            return 0;
          });
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.log(err);
          this.toastr.error('Erro ao buscar os centros', '');
        }
      });
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
      this.fluxoService.postOrPutClienteFluxo(values, this.statusForm)
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
    this.initDefaults();
    this.createForm.reset();
    this.createForm.get('id')?.setValue(null);
    this.createForm.get('tipo')?.setValue(null);

    this.page = null;

    this.disableFormFields();
    this.createForm.controls['id'].enable();
    this.submitted = false;
    this.statusForm = 1;
    this.flgPesquisandoCliente = 0;
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
          this.fluxoService.delClienteFluxo(id)
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
    const searchObj: GenericPesquisaDTO<ClienteFluxoCaixaDTO> = {
      object: rawValue,
      pageNumber: 0,
      pageSize: this.pageSize,
      dtaInicialPesquisa: rawValue.dtaInicialPesquisa,
      dtaFinalPesquisa: rawValue.dtaFinalPesquisa,
      dtaReferenciaInicial: rawValue.dtaReferenciaInicial,
      dtaReferenciaFinal: rawValue.dtaReferenciaFinal,
      usuarioInclusao: null,
      valorInicial: rawValue.valorInicial,
      valorFinal: rawValue.valorFinal,
    };
    this.onPesquisaItem(searchObj);
  }

  onPesquisaSintetico(): void {
    const rawValue = this.createForm.getRawValue();
    const searchObj: GenericPesquisaDTO<ClienteFluxoCaixaDTO> = {
      object: rawValue,
      pageNumber: 0,
      pageSize: this.pageSize,
      dtaInicialPesquisa: rawValue.dtaInicialPesquisa,
      dtaFinalPesquisa: rawValue.dtaFinalPesquisa,
      dtaReferenciaInicial: rawValue.dtaReferenciaInicial,
      dtaReferenciaFinal: rawValue.dtaReferenciaFinal,
      usuarioInclusao: null,
      valorInicial: rawValue.valorInicial,
      valorFinal: rawValue.valorFinal,
    };
    this.onPesquisaItemSintetico(searchObj);
  }

  onPesquisaItemSintetico(itemPesqDTO: any): void {
    this.spinner.show('fullSpinner');
    this.fluxoService.findClienteFluxoSintetico(itemPesqDTO)
      .subscribe({
        next: (data) => {
          this.spinner.hide('fullSpinner');
          console.log(data);
          this.cdr.markForCheck();
          this.openPrintClienteSintetico(data);
        },
        error: () => {
          this.spinner.hide('fullSpinner');
          this.cdr.markForCheck();
        }
      });
  }

  typeaHeadSelectCliente(event: any): void {
    this.selectClienteByCod(event.item.id);
  }

  setPage(pageInfo: any) {
    const rawValue = this.createForm.getRawValue();
    const searchObj: GenericPesquisaDTO<ClienteFluxoCaixaDTO> = {
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
    this.fluxoService.findClienteFluxo(itemPesqDTO)
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

  openPrintClienteSintetico(fluxoDataSintetic: any): void {

    const id = new Date().getTime();
    const key =
      this.currentUserSalesApp.username +
      '_' +
      id.toString();

    

    this.fluxoService
      .storageSet(key, { id: 'fluxo-cliente-sintetico', data: fluxoDataSintetic })
      .subscribe(
        (resp) => {
          // console.log(resp);
          console.log('Deu tudo certo, vamos imprimir');
          const hrefFull =
            this.fluxoService.hrefContext() + 'print/fluxo-cliente-sintetico/' + key;
          // console.log(hrefFull);
          this.router.navigate([]).then((result) => {
            window.open(hrefFull, '_blank');
          });
          this.cdr.detectChanges();
        },
        (error) => {
          console.log(error);
          this.toastr.error('Erro ao tentar imprimir, contate o administrador','');
          console.log(
            'Erro ao tentar imprimir, contate o administrador, não salvou no indexdDB'
          );
          this.cdr.detectChanges();
        }
      );
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

  dtoToForm(dto: ClienteFluxoCaixaDTO): void {
    this.createForm.get('id')?.setValue(dto.id);
    this.createForm.get('vendaId')?.setValue(dto.vendaId);
    this.createForm.get('dtaReferencia')?.setValue(dto.dtaReferencia);
    this.createForm.get('condicaoPagamentoDTO')?.setValue(dto.condicaoPagamentoDTO);
    this.createForm.get('fluxoCaixaTipoDTO')?.setValue(dto.fluxoCaixaTipoDTO);
    this.createForm.get('fluxoCaixaCentroDTO')?.setValue(dto.fluxoCaixaCentroDTO);
    this.createForm.get('valor')?.setValue(dto.valor);
    this.createForm.get('clienteDTO')?.setValue(dto.clienteDTO);
    this.createForm.get('clienteId')?.setValue(dto.clienteDTO!.id);
    
    //this.createForm.get('nome')?.setValue(dto.nome);
    this.createForm.get('descricao')?.setValue(dto.descricao);
    //this.createForm.get('status')?.setValue(dto.status);
    this.createForm.get('dtaInclusao')?.setValue(this.toDateField(dto.dtaInclusao));
    this.createForm.get('dtaUltAlteracao')?.setValue(this.toDateField(dto.dtaUltAlteracao));
    this.createForm.get('usuarioInclusao')?.setValue(dto.usuarioInclusao);
    this.createForm.get('usuarioUltAlteracao')?.setValue(dto.usuarioUltAlteracao);
    //this.createForm.get('tipo')?.setValue(dto.tipo);
  }


  compareGeneric(c1: any, c2: any): boolean {
    return c1 === c2;
  }
  compareGenericWithBoleanStatus(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.status === c2.status : c1 === c2;
  }

  compareGenericWithId(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
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