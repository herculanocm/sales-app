import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { PrintVendaService } from './print-venda.service';
import { EstoqueAlmoxarifadoDTO } from '../print-utils';
import { PrintObjectVenda, PrintObjectVendaV2 } from '@modules/shared/models/print';
import { RotaAux } from '@app/app.utils';
import moment from 'moment';
import 'moment/locale/pt-br';

@Component({
  selector: 'app-print-venda',
  templateUrl: './print-venda.component.html',
  styleUrls: ['./print-venda.component.scss']
})
export class PrintVendaComponent implements OnInit {

  pv!: PrintObjectVendaV2;
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
        this.pv = {
          id: '',
          data: data
        };
        this.spinner.hide();
        this._printVendaService.storageDelete(id!).subscribe(() => {
          console.log('removing');
        });

        this.titleService.setTitle('pedidos_' + moment().format('YYYY_MM_DD_HH_mm_ss'));

        this.pv.data.forEach(async v => {
          v.vendaItemDTOs.forEach((el: any) => {
            if (el.vlr > el.vlrOrig) {
              el.vlrOrigCalc = el.vlr;
              el.vlrDesconto = 0;
            } else {
              el.vlrOrigCalc = el.vlrOrig;
            }
          });

          if (v.vlrDescontoProdutos === 0 &&
            (v.vlrProdutos > v.vlrProdutosSDesconto)
          ) {
            v.vlrProdutosSDescontoCalc = v.vlrProdutos;
          } else {
            v.vlrProdutosSDescontoCalc = v.vlrProdutosSDesconto;
          }

          this.cdr.detectChanges();
          await this.delay(250);
          window.print();
          this.cdr.detectChanges();

        });
        



   

    

      }, (error) => { this.spinner.hide(); });
  }

  isUndefined(value: any): boolean {
    return typeof (value) === 'undefined';
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
