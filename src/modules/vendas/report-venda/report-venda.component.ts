import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import 'moment/locale/pt-br';
import { AppVendaModalAlertComponent } from '../modals/app-venda-modal-alert/app-venda-modal-alert.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { CurrentUserSalesAppAux, IndicadoresVendaAux } from '@modules/shared/models/generic';
import { FuncionarioAux } from '@modules/shared/models/funcionario';
import { FuncionarioService, VendaService } from '@modules/shared/services';
import { MunicipioDTO } from '@modules/shared/models/layout.utils';

@Component({
  selector: 'app-venda-report-venda',
  templateUrl: './report-venda.component.html',
  styleUrls: ['./report-venda.component.scss'],
})
export class ReportVendaComponent implements OnInit {
  ColumnMode!: ColumnMode;
  submitted: boolean;
  statusForm!: number;
  buscaForm!: FormGroup;
  currentUserSalesApp!: CurrentUserSalesAppAux;
  vendedores!: FuncionarioAux[] | undefined;
  flgPesqVenda: number;
  retornoIndicadoresVenda: IndicadoresVendaAux[] = [];

  constructor(
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private _modalService: NgbModal,
    private _funcionarioService: FuncionarioService,
    private _vendaService: VendaService,
    private spinner: NgxSpinnerService
  ) {
    this.submitted = false;
    this.flgPesqVenda = 0;
  }
  ngOnInit(): void {
    this.currentUserSalesApp = JSON.parse(
      sessionStorage.getItem('currentUserSalesApp')!
    );
    this.iniciaObjs();
    this.createForm();
    

    if (
      this.currentUserSalesApp.funcionarioDTO != null &&
      this.currentUserSalesApp.funcionarioDTO.id != null &&
      this.currentUserSalesApp.funcionarioDTO.id > 0
    ) {
      const funAux: FuncionarioAux = new FuncionarioAux();

      funAux.id = this.currentUserSalesApp.funcionarioDTO.id;
      funAux.nome = this.currentUserSalesApp.funcionarioDTO.nome;
      funAux.indSupervisor =
        this.currentUserSalesApp.funcionarioDTO.indSupervisor;

      this.buscaForm.patchValue({
        vendedor: funAux,
      });

      if (funAux.indSupervisor == null || funAux.indSupervisor === false) {
        this.buscaForm.controls['vendedor'].disable();
      }
    }
    this.cdr.detectChanges();
  }
  
  iniciaObjs(): void {
    this.flgPesqVenda = 0;
    this.getVendedores();
  }

  getVendedores(): void {
    const currentUserSalesApp = JSON.parse(
        sessionStorage.getItem('currentUserSalesApp')!
      );
    this._funcionarioService
      .getAllActiveVendedorByusername(currentUserSalesApp.username)
      .subscribe({
        next: (data) => {
            this.vendedores = [...data];
            this.vendedores!.sort((v1, v2) => {
                if (v1.nome < v2.nome) {
                  return -1;
                }
                if (v1.nome > v2.nome) {
                  return 1;
                }
                return 0;
              });
              this.cdr.markForCheck();
        }
      });
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  pop(tipo: string, titulo: string, msg: string): void {
    if (tipo === 'error') {
      this.toastr.error(msg, titulo);
    } else if (tipo === 'success') {
      this.toastr.success(msg, titulo);
    } else if (tipo === 'warning') {
      this.toastr.warning(msg, titulo);
    } else {
      this.toastr.info(msg, titulo);
    }
  }

  compareVendedor(v1: FuncionarioAux, v2: FuncionarioAux): boolean {
    return v1 && v2 ? v1.id === v2.id : v1 === v2;
  }

  compareCidade(v1: MunicipioDTO, v2: MunicipioDTO): boolean {
    return v1 && v2 ? v1.id === v2.id : v1 === v2;
  }

  onLimpa(): void {
    this.submitted = false;
    this.flgPesqVenda = 0;
    this.retornoIndicadoresVenda = [];
  }

  onPesquisa(): void {
    this.submitted = true;
    const formRawValue: any = this.buscaForm.getRawValue();
    console.log(formRawValue);
    if (this.buscaForm.invalid) {
      // console.log(this.getFormValidationErrorsV2(this.pedidoForm));
      // console.log(this.getFormValidationErrorsV2(formCliente));
      this.msgAlerta(
        'Atenção',
        `Existe campos que ainda precisam ser preenchidos`,
        'error'
      );
    } else {
      this.buscaIndicadoresVenda(formRawValue.dtaEmissaoInicial, formRawValue.dtaEmissaoFinal, formRawValue.vendedor.id);
    }
  }

  getIndQtdItensTotal(): number {
    return this.retornoIndicadoresVenda.length;
  }

  getIndDistinctCountItensVendidos(): number {
    const flt = this.retornoIndicadoresVenda.filter( (item) => {
        return item.qtd_convertido > 0;
    });
    return flt.length;
  }

  buscaIndicadoresVenda(dtaInicialPesquisa: string, dtaFinalPesquisa: string, vendedorId: number): void {
    this.spinner.show('indicadorVenda');
    this._vendaService.getIndicadoresVenda(dtaInicialPesquisa, dtaFinalPesquisa, vendedorId)
    .subscribe({
        next: (data) => {
            this.spinner.hide('indicadorVenda');
            this.retornoIndicadoresVenda = [...data];
            this.flgPesqVenda = 1;
            this.cdr.markForCheck();
        },
        error: (error) => {
            this.spinner.hide('indicadorVenda');
            console.error(error);
            this.msgAlerta(
            'Erro',
            'Erro ao buscar indicadores de venda',
            'error'
            );
        },
    });
  }

  createForm(): void {
    this.buscaForm = new FormGroup({
      dtaEmissaoInicial: new FormControl(this.convertDate(new Date(), 0), [
        Validators.required,
      ]),
      dtaEmissaoFinal: new FormControl(this.convertDate(new Date(), 0), [
        Validators.required,
      ]),
      vendedor: new FormControl(null, [Validators.required]),
      cidade: new FormControl(null),
    });
  }
  get f() {
    return this.buscaForm.controls;
  }

  convertDate(inputFormat: any, dia: any) {
    function pad(s: any) {
      return s < 10 ? '0' + s : s;
    }
    const d = new Date(inputFormat);
    return [
      d.getFullYear(),
      pad(d.getMonth() + 1),
      pad(d.getDate() + dia),
    ].join('-');
  }

  msgAlerta(titulo: string, conteudo: string, tipo: string): void {
    const activeModal = this._modalService.open(AppVendaModalAlertComponent, {
      backdrop: true,
    });
    activeModal.componentInstance.modalHeader = titulo;
    activeModal.componentInstance.modalContent = conteudo;
    activeModal.componentInstance.modalType = tipo;
    activeModal.result.then(
      (result) => {
        console.log(result);
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
