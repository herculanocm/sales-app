import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { EstoqueAlmoxarifadoDTO } from '../print-utils';
import 'moment/locale/pt-br';
import { VdPrintService } from './vdprint.service';
import { PrintObjectVenda } from './vdprint.utils';
import { RomaneioEntrega, VendaDTO } from '@modules/shared/models/venda';
import { VendaService } from '@modules/shared/services';

export interface IdsAux {
  id: number;
}

@Component({
  selector: 'app-vd-print',
  templateUrl: './vdprint.component.html',
  styleUrls: ['./vdprint.component.scss'],
})
export class VdPrintComponent implements OnInit {
  pv!: PrintObjectVenda;
  dataImpressao: Date;
  estoqueAlmoxarifados!: EstoqueAlmoxarifadoDTO[];

  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    private spinner: NgxSpinnerService,
    private cdr: ChangeDetectorRef,
    private _printVendaService: VdPrintService,
    private _vendaService: VendaService
  ) {
    this.dataImpressao = new Date();
  }

  ngOnInit() {
    this.titleService.setTitle('Sales - Impressão');
    this.spinner.show();
    const id = this.route.snapshot.paramMap.get('id');
    this._printVendaService.storageGet(id!).subscribe(
      async (data) => {
        this.spinner.hide();
        this.pv = data;
        console.log(this.pv);
        if (!this.isUndefined(this.pv)) {
          this.titleService.setTitle('pedidos_' + id);

          this._printVendaService.storageDelete(id!).subscribe(() => {
            console.log('removing');
          });

          //console.log(ids);

          //let romaneioEntregas: RomaneioEntrega[] = [];
          // if (ids.length > 0) {
          //    romaneioEntregas = await lastValueFrom(this._vendaService.findRomaneioEntregas(ids));
          // }

          this.pv.data.forEach((ved) => {
            ved.statusConfirmacao =
              this._vendaService.getUltStatusConfirmacao(ved);
            ved.statusAprovacao = this._vendaService.getUltStatusAprovado(ved);
            ved.statusFaturamento =
              this._vendaService.getUltStatusFaturado(ved);

            if (
              ved.clienteDTO &&
              ved.clienteDTO.celular1 &&
              ved.clienteDTO.celular1 !== null
            ) {
              ved.clienteDTO.celular1 = ved.clienteDTO?.celular1.toString();
            }

            if (
              ved.clienteDTO &&
              ved.clienteDTO.celular2 &&
              ved.clienteDTO.celular2 !== null
            ) {
              ved.clienteDTO.celular2 = ved.clienteDTO?.celular2.toString();
            }

            if (
              ved.clienteDTO &&
              ved.clienteDTO.telefone1 &&
              ved.clienteDTO.telefone1 !== null
            ) {
              ved.clienteDTO.telefone1 = ved.clienteDTO?.telefone1.toString();
            }

            if (
              ved.clienteDTO &&
              ved.clienteDTO.telefone2 &&
              ved.clienteDTO.telefone2 !== null
            ) {
              ved.clienteDTO.telefone2 = ved.clienteDTO?.telefone2.toString();
            }

            ved.vendaItemDTOs.forEach((el: any) => {
              if (el.vlr > el.vlrOrig) {
                el.vlrOrigCalc = el.vlr;
                el.vlrDesconto = 0;
              } else {
                el.vlrOrigCalc = el.vlrOrig;
              }
            });

            if (
              ved.vlrDescontoProdutos === 0 &&
              ved.vlrProdutos > ved.vlrProdutosSDesconto
            ) {
              ved.vlrProdutosSDescontoCalc = ved.vlrProdutos;
            } else {
              ved.vlrProdutosSDescontoCalc = ved.vlrProdutosSDesconto;
            }

            ved.rotas = [];
          });
          this.cdr.detectChanges();
          await this.delay(250);
          window.print();
        }
      },
      (error) => {
        console.log(error);
        this.spinner.hide();
      }
    );
  }

  isUndefined(value: any): boolean {
    return typeof value === 'undefined';
  }

  getTotalProdutosSistema(vd: VendaDTO): number {
    if (
      vd.vlrDescontoProdutos > 0 &&
      vd.vlrProdutosSDescontoCalc <= vd.vlrProdutos
    ) {
      return vd.vlrProdutos + vd.vlrDescontoProdutos;
    } else {
      return vd.vlrProdutosSDescontoCalc;
    }
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  isEmissorCheque(vd: VendaDTO): number {
    if (
      vd.clienteDTO!.clienteEmissorDTOs.length > 0 &&
      vd.condicaoPagamentoDTO!.nome.indexOf('CHEQUE') >= 0
    ) {
      return 1; // é cheque e o cliente possui emissor
    } else if (
      vd.clienteDTO!.clienteEmissorDTOs.length === 0 &&
      vd.condicaoPagamentoDTO!.nome.indexOf('CHEQUE') >= 0
    ) {
      return 0; // é cheque mais o cliente não tem emissor
    } else {
      return -1; // não é para exibir
    }
  }
  isCancelado(vd: VendaDTO): boolean {
    if (
      vd.vendaStatusAtualDTO != null &&
      vd.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'CC'
    ) {
      return true;
    } else {
      return false;
    }
  }
  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
