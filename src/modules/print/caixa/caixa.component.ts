import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { CaixaPrintService } from './caixa.service';


@Component({
  selector: 'app-print-caixa',
  templateUrl: './caixa.component.html',
  styleUrls: ['./caixa.component.scss']
})
export class CaixaPrintComponent implements OnInit {

  dataImpressao: Date;
  fatorDiv: number;
  caixa: any;

  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    private _caixaPrintService: CaixaPrintService,
    private spinner: NgxSpinnerService,
  ) {
    this.dataImpressao = new Date();
    this.fatorDiv = 100000;
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }


  ngOnInit() {

    this.spinner.show();

    const id = this.route.snapshot.paramMap.get('id');

    this._caixaPrintService.storageGet(id!)
      .subscribe(async (data) => {
        console.log(data);

        this.caixa = data.caixaDTO;


        this.titleService.setTitle('caixa_id_' + this.caixa.id);
        this.spinner.hide();

        this._caixaPrintService.storageDelete(id!).subscribe(() => {
          console.log('removing');
        });
        await this.delay(1000);
        window.print();
      }, (error) => {
        this.spinner.hide();
      });
  }

  isUndefined(value: any): boolean {
    return typeof (value) === 'undefined';
  }
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getValorTotalEntradaTable(row: any): number {
    let vlrTotal = 0;
    row.caixaResultado.caixaResultado.forEach((cr: any) => {
      vlrTotal += cr.vlrEntrada;
    });
    return vlrTotal;
  }



  getValorTotalSaidaTable(row: any): number {
    let vlrTotal = 0;
    row.caixaResultado.caixaResultado.forEach((cr: any) => {
      vlrTotal += cr.vlrSaida;
    });
    return vlrTotal;
  }

  getValorTotalDifTable(row: any): number {
    let vlrTotal = 0;
    row.caixaResultado.caixaResultado.forEach((cr: any) => {
      vlrTotal += cr.vlrDif;
    });
    return vlrTotal;
  }
}
