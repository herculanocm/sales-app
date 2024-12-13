import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { PrintVendaService } from './print-venda.service';
import { EstoqueAlmoxarifadoDTO } from '../print-utils';
import { PrintObjectVenda } from '@modules/shared/models/print';
import { RotaAux } from '@app/app.utils';

@Component({
  selector: 'app-print-venda',
  templateUrl: './print-venda.component.html',
  styleUrls: ['./print-venda.component.scss']
})
export class PrintVendaComponent implements OnInit {

  pv: PrintObjectVenda;
  dataImpressao: Date;
  estoqueAlmoxarifados!: EstoqueAlmoxarifadoDTO[];

  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    private spinner: NgxSpinnerService,
    private _printVendaService: PrintVendaService,
    private cdr: ChangeDetectorRef,
  ) {
    this.dataImpressao = new Date();
    this.pv = new PrintObjectVenda();
  }

  ngOnInit() {

    /*
    antigo
    const id = this.route.snapshot.paramMap.get('id');
    this.pv = JSON.parse(localStorage.getItem(id));
    this.titleService.setTitle('pedido_num_' + this.pv.data.id + '_st_' + this.pv.data.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla);
    // console.log(this.pv);
    localStorage.removeItem(id);

    this.pv.data.vendaItemDTOs.forEach(el => {
      if (el.vlr > el.vlrOrig) {
        el.vlrOrigCalc = el.vlr;
        el.vlrDesconto = 0;
      } else {
        el.vlrOrigCalc = el.vlrOrig;
      }
    });

    window.print();
    */
    this.spinner.show();
    const id = this.route.snapshot.paramMap.get('id');
    this._printVendaService.storageGet(id!)
      .subscribe(async (data) => {
        this.pv = data;
        this.spinner.hide();
        this._printVendaService.storageDelete(id!).subscribe(() => {
          console.log('removing');
        });
        this.titleService.setTitle('pedido_num_' + this.pv.data.id + '_st_' + this.pv.data.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla);

        this.pv.data.vendaItemDTOs.forEach((el: any) => {
          if (el.vlr > el.vlrOrig) {
            el.vlrOrigCalc = el.vlr;
            el.vlrDesconto = 0;
          } else {
            el.vlrOrigCalc = el.vlrOrig;
          }
        });

        if (this.pv.data.vlrDescontoProdutos === 0 &&
          (this.pv.data.vlrProdutos > this.pv.data.vlrProdutosSDesconto)
        ) {
          this.pv.data.vlrProdutosSDescontoCalc = this.pv.data.vlrProdutos;
        } else {
          this.pv.data.vlrProdutosSDescontoCalc = this.pv.data.vlrProdutosSDesconto;
        }
        const rotasReps: any = await this._printVendaService.getRotaByVendaId(this.pv.data.id!).toPromise();
        const estoques = await this._printVendaService.getAllEstoque().toPromise();

        const fltEst = estoques!.filter(et => {
          return et.id == this.pv.data.estoqueAlmoxarifadoId;
        });


        if (fltEst.length > 0) {
          this.pv.data.estoqueAlmoxarifadoDTO = fltEst[0];
        }

        const rotas: RotaAux[] = rotasReps;

        this.pv.data.rotas = rotas;
        this.cdr.detectChanges();
        await this.delay(250);
        window.print();
        this.cdr.detectChanges();
      }, (error) => { this.spinner.hide(); });
  }

  isUndefined(value: any): boolean {
    return typeof (value) === 'undefined';
  }

  getTotalProdutosSistema(): number {
    if (this.pv.data.vlrDescontoProdutos > 0 &&
      this.pv.data.vlrProdutosSDescontoCalc <= this.pv.data.vlrProdutos) {
      return (this.pv.data.vlrProdutos + this.pv.data.vlrDescontoProdutos);
    } else {
      return this.pv.data.vlrProdutosSDescontoCalc;
    }
  }
  isCancelado(): boolean {
    if (
      this.pv != null &&
      this.pv.data != null &&
      this.pv.data.vendaStatusAtualDTO != null &&
      this.pv.data.vendaStatusAtualDTO.vendaStatusLabelDTO.sigla === 'CC'
    ) {
      return true;
    } else {
      return false;
    }
  }
  isEmissorCheque(): number {
    if (
      this.pv != null &&
      this.pv.data != null &&
      this.pv.data.clienteDTO!.clienteEmissorDTOs.length > 0 &&
      this.pv.data.condicaoPagamentoDTO!.nome.indexOf('CHEQUE') >= 0
    ) {
      return 1; // é cheque e o cliente possui emissor
    } else if (
      this.pv != null &&
      this.pv.data != null &&
      this.pv.data.clienteDTO!.clienteEmissorDTOs.length === 0 &&
      this.pv.data.condicaoPagamentoDTO!.nome.indexOf('CHEQUE') >= 0
    ) {
      return 0; // é cheque mais o cliente não tem emissor
    } else {
      return -1; // não é para exibir
    }
  }
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
