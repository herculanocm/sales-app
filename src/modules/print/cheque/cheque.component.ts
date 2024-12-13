import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChequePrintService } from './cheque.service';
import { ChequeRecebidoDTO } from '@modules/shared/models/titulo';
import moment from 'moment';

@Component({
  selector: 'app-print-cheque',
  templateUrl: './cheque.component.html',
  styleUrls: ['./cheque.component.scss']
})
export class ChequePrintComponent implements OnInit {

  dataImpressao: Date;
  cheques: ChequeRecebidoDTO[] = [];
  dataMoment = '';
  currentUserSalesApp!: any;

  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    private spinner: NgxSpinnerService,
    private _chequePrintService: ChequePrintService
  ) {
    this.dataImpressao = new Date();
  }

  getValorTotal(): number {
    let vlr = 0;
    this.cheques.forEach(ch => {
      vlr += ch.vlr;
    });
    return vlr;
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }


  ngOnInit() {

    this.spinner.show();
    this.dataMoment = moment().format('YYYY_MM_DD_HH_mm_ss');
    this.currentUserSalesApp = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);

    const id = this.route.snapshot.paramMap.get('id');

    this._chequePrintService.storageGet(id!)
      .subscribe(async (data) => {
        console.log(data);

        this.cheques = data.cheques;


        this.titleService.setTitle('cheques_' + this.dataMoment);
        this.spinner.hide();

        this._chequePrintService.storageDelete(id!).subscribe(() => {
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
