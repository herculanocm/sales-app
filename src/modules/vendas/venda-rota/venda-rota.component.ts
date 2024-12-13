import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
import { VendaDTO, VendaRotaStatus } from '@modules/shared/models/venda';
import { FuncionarioService, VendaService } from '@modules/shared/services';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-venda-venda-rota',
  templateUrl: './venda-rota.component.html',
  styleUrls: ['./venda-rota.component.scss'],
})
export class VendaRotaComponent implements OnInit {
  ColumnMode!: ColumnMode;
  submitted: boolean;
  statusForm!: number;
  buscaForm!: FormGroup;
  currentUserSalesApp!: CurrentUserSalesAppAux;
  vendedores!: FuncionarioAux[] | undefined;
  flgPesqVenda!: number;
  vendaRotaStatuss: VendaRotaStatus[];
  flgSupervisor = false;

  constructor(
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private _vendaService: VendaService,
    private _modalService: NgbModal,
    private _funcionarioService: FuncionarioService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {
    this.submitted = false;
    this.vendaRotaStatuss = [];
  }
  async ngOnInit(): Promise<void> {
    this.currentUserSalesApp = JSON.parse(
      sessionStorage.getItem('currentUserSalesApp')!
    );

    this.createForm();
    await this.iniciaObjs();

    if (
      this.currentUserSalesApp.funcionarioDTO != null &&
      this.currentUserSalesApp.funcionarioDTO.id != null &&
      this.currentUserSalesApp.funcionarioDTO.id > 0
    ) {
      const funAux: FuncionarioAux = new FuncionarioAux();
      funAux.id = this.currentUserSalesApp.funcionarioDTO.id;
      funAux.nome = this.currentUserSalesApp.funcionarioDTO.nome;

      this.buscaForm.patchValue({
        vendedor: funAux,
      });

      if (
        this.currentUserSalesApp.funcionarioDTO.indSupervisor == null ||
        this.currentUserSalesApp.funcionarioDTO.indSupervisor === false
      ) {
        this.flgSupervisor = false;
        this.buscaForm.controls['vendedor'].disable();
      } else {
        this.flgSupervisor = true;
        this.buscaForm.controls['vendedor'].enable();
      }
    }
  }
  async iniciaObjs(): Promise<void> {
    this.flgPesqVenda = 0;
    this.vendedores = await lastValueFrom(
      this._funcionarioService.getAllActiveVendedorByusername(
        this.currentUserSalesApp.username
      )
    );
    this.vendedores!.sort((v1, v2) => {
      if (v1.nome < v2.nome) {
        return -1;
      }
      if (v1.nome > v2.nome) {
        return 1;
      }
      return 0;
    });
    this.cdr.detectChanges();
  }
  compareVendedor(v1: FuncionarioAux, v2: FuncionarioAux): boolean {
    return v1 && v2 ? v1.id === v2.id : v1 === v2;
  }

  onLimpa(): void {
    this.submitted = false;
    this.vendaRotaStatuss = [];
    this.flgPesqVenda = 0;
    this.cdr.detectChanges();
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  isUndefined(value: any): boolean {
    return typeof value === 'undefined';
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

  imprimeVenda(idPreVenda: number): void {
    if (idPreVenda != null && idPreVenda > 0) {
      this.flgPesqVenda = 1;
      this._vendaService.findById(idPreVenda).subscribe({
        next: (data) => {
          this.flgPesqVenda = 0;
          this.openPrintPage(data);
          this.cdr.detectChanges();
        },
        error: () => {
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

  onPesquisa(): void {
    this.submitted = true;
    if (this.buscaForm.invalid) {
      // console.log(this.getFormValidationErrorsV2(this.pedidoForm));
      // console.log(this.getFormValidationErrorsV2(formCliente));
      this.msgAlerta(
        'Atenção',
        `Existe campos que ainda precisam ser preenchidos`,
        'error'
      );
    } else {
      this.spinner.show('fullSpinner');
      const valores = this.buscaForm.getRawValue();
      this._vendaService
        .getStatusVendaRota(valores.dtaEmissao, valores.vendedor.id)
        .subscribe({
          next: (data) => {
            this.spinner.hide('fullSpinner');
            this.vendaRotaStatuss = data.sort((v1, v2) => {
              if (v1.venda_id < v2.venda_id) {
                return -1;
              }
              if (v1.venda_id > v2.venda_id) {
                return 1;
              }
              return 0;
            });
            console.log(this.vendaRotaStatuss);
            this.cdr.detectChanges();
          },
          error: () => {
            this.spinner.hide('fullSpinner');
            this.cdr.detectChanges();
          },
        });
    }
  }

  createForm(): void {
    this.buscaForm = new FormGroup({
      dtaEmissao: new FormControl(this.convertDate(new Date(), 0), [
        Validators.required,
      ]),
      vendedor: new FormControl(null, [Validators.required]),
    });
  }
  get f() {
    return this.buscaForm.controls;
  }

  convertDate(inputFormat: any, dia: any) {
    function pad(s: number) {
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
