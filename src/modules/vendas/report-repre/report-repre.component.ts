import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import 'moment/locale/pt-br';
import { AppVendaModalAlertComponent } from '../modals/app-venda-modal-alert/app-venda-modal-alert.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { CurrentUserSalesAppAux } from '@modules/shared/models/generic';
import { FuncionarioAux } from '@modules/shared/models/funcionario';
import {
  RetornoClientes,
  RetornoItens,
  RetornoPedidos,
  RetornoStatus,
} from '@modules/shared/models/reports';
import { FuncionarioService, LayoutService, VendaService } from '@modules/shared/services';
import { VendaDTO } from '@modules/shared/models/venda';
import { MunicipioDTO } from '@modules/shared/models/layout.utils';

@Component({
  selector: 'app-venda-report-repre',
  templateUrl: './report-repre.component.html',
  styleUrls: ['./report-repre.component.scss'],
})
export class ReportRepreComponent implements OnInit {
  ColumnMode!: ColumnMode;
  submitted: boolean;
  statusForm!: number;
  buscaForm!: FormGroup;
  currentUserSalesApp!: CurrentUserSalesAppAux;
  vendedores!: FuncionarioAux[] | undefined;
  retornoStatus: RetornoStatus[];
  retornoStatusItens: RetornoStatus[];
  retornoClientes: RetornoClientes[];
  retornoItens: RetornoItens[];
  retornoPedidos: RetornoPedidos[];
  flgPesqVenda: number;
  cidades: MunicipioDTO[] = [];

  constructor(
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private _vendaService: VendaService,
    private _modalService: NgbModal,
    private _funcionarioService: FuncionarioService,
    private spinner: NgxSpinnerService,
    private layoutService: LayoutService,
    private router: Router
  ) {
    this.submitted = false;
    this.retornoStatus = [];
    this.retornoStatusItens = [];
    this.retornoClientes = [];
    this.retornoItens = [];
    this.retornoPedidos = [];
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
    this.getCidades();
  }

  getCidades(): void {
    this.layoutService.buscaMunicipiosByCache()
    .subscribe({
        next: (data) => {
            this.cidades = [...data];
            this.cdr.markForCheck();
        }
    });
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
    this.retornoStatus = [];
    this.retornoStatusItens = [];
    this.retornoClientes = [];
    this.retornoItens = [];
    this.retornoPedidos = [];
    this.flgPesqVenda = 0;
  }

  onPesquisa(): void {
    this.submitted = true;
    console.log(this.buscaForm.getRawValue());
    if (this.buscaForm.invalid) {
      // console.log(this.getFormValidationErrorsV2(this.pedidoForm));
      // console.log(this.getFormValidationErrorsV2(formCliente));
      this.msgAlerta(
        'Atenção',
        `Existe campos que ainda precisam ser preenchidos`,
        'error'
      );
    } else {
      this.atualizaStatus();
      this.atualizaStatusItens();
      this.atualizaClientes();
      this.atualizaItens();
      this.atualizaPedidos();
    }
  }

  atualizaStatus(): void {
    this.spinner.show('status');
    this._vendaService
      .buscaReportStatus(this.buscaForm.getRawValue())
      .subscribe({
        next: (data) => {
          this.spinner.hide('status');
          this.retornoStatus = data;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.spinner.hide('status');
        },
      });
  }

  atualizaStatusItens(): void {
    this.spinner.show('status');
    this._vendaService
      .buscaReportStatusItens(this.buscaForm.getRawValue())
      .subscribe({
        next: (data) => {
          this.spinner.hide('status');
          this.retornoStatusItens = data;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.spinner.hide('status');
        },
      });
  }

  atualizaClientes(): void {
    this.spinner.show('cliente');
    this._vendaService
      .buscaReportClientes(this.buscaForm.getRawValue())
      .subscribe({
        next: (data) => {
          this.spinner.hide('cliente');
          this.retornoClientes = data;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.spinner.hide('cliente');
        },
      });
  }

  atualizaItens(): void {
    this.spinner.show('item');
    this._vendaService
      .buscaReportItens(this.buscaForm.getRawValue())
      .subscribe({
        next: (data) => {
          this.spinner.hide('item');
          this.retornoItens = data;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.spinner.hide('item');
        },
      });
  }

  atualizaPedidos(): void {
    this.spinner.show('pedido');
    this._vendaService
      .buscaReportPedidos(this.buscaForm.getRawValue())
      .subscribe({
        next: (data) => {
          this.spinner.hide('pedido');
          this.retornoPedidos = data;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.spinner.hide('pedido');
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

  imprimeVenda(idPreVenda: number): void {
    if (idPreVenda != null && idPreVenda > 0) {
      this.flgPesqVenda = 1;
      this._vendaService.findById(idPreVenda).subscribe({
        next: (data) => {
          this.flgPesqVenda = 0;
          this.openPrintPage(data);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.flgPesqVenda = 0;
          this.pop('error', 'Erro ao buscar a pre-venda', '');
          this.cdr.detectChanges();
        },
      });
    } else {
      this.flgPesqVenda = 0;
      this.pop(
        'error',
        'Só é possivel imprimir titulos gerados por pre-venda',
        ''
      );
      this.cdr.detectChanges();
    }
  }

  openPrintPage(vendaDTO: VendaDTO): void {
    vendaDTO.statusConfirmacao =
      this._vendaService.getUltStatusConfirmacao(vendaDTO);
    vendaDTO.statusAprovacao =
      this._vendaService.getUltStatusAprovado(vendaDTO);
    vendaDTO.statusFaturamento =
      this._vendaService.getUltStatusFaturado(vendaDTO);

    const id = new Date().getTime();
    const key =
      this.currentUserSalesApp.username +
      '_' +
      id.toString() +
      '_' +
      vendaDTO.id;

    this._vendaService
      .storageSet(key, { id: 'venda', data: vendaDTO })
      .subscribe(
        (resp) => {
          console.log(resp);
          console.log('Deu tudo certo, vamos imprimir');
          const hrefFull =
            this._vendaService.hrefContext() + 'print/venda/' + key;
          // console.log(hrefFull);
          this.router.navigate([]).then((result) => {
            window.open(hrefFull, '_blank');
          });
          this.cdr.detectChanges();
        },
        (error) => {
          console.log(error);
          this.pop(
            'error',
            'Erro ao tentar imprimir, contate o administrador',
            ''
          );
          console.log(
            'Erro ao tentar imprimir, contate o administrador, não salvou no indexdDB'
          );
          this.cdr.detectChanges();
        }
      );
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
