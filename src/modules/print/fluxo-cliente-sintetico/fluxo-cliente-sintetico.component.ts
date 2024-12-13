import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { FluxoService } from '@modules/shared/services';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Observable } from 'rxjs';
import { ClienteFluxoSintetico, ClienteFluxoTransactions, StorageGetClienteFluxoSintetico } from '@modules/shared/models/fluxo-caixa';
import moment from 'moment';
import { ngxCsv } from 'ngx-csv';

export interface ClienteAuxTable {
  id: number;
  nome: string;
  fantasia: string;
}

@Component({
  selector: 'app-print-fluxo-cliente-sintetico',
  templateUrl: './fluxo-cliente-sintetico.component.html',
  styleUrls: ['./fluxo-cliente-sintetico.component.scss']
})
export class FluxoClienteSinteticoPrintComponent implements OnInit {

  pr: StorageGetClienteFluxoSintetico | undefined;

  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    // private _printService: PrintService,
    private spinner: NgxSpinnerService,
    private cdr: ChangeDetectorRef,
    private storage: StorageMap,
  ) {
  }

  storageGet(chave: string): Observable<any> {
    return this.storage.get(chave);
  }
  storageDelete(chave: string): Observable<any> {
      return this.storage.delete(chave);
  }

  printRw(rw: ClienteFluxoSintetico): void {
    console.log(rw);

    rw.transactions.sort((obj1, obj2) => {
      if (obj1.ordem > obj2.ordem) {
          return 1;
      }
      if (obj1.ordem < obj2.ordem) {
          return -1;
      }
      return 0;
  });

    const dtaAtualUser = moment().format('YYYY_MM_DD_HH_mm_ss');
                    const nameReport = 'fluxo_' +  rw.cliente_id + '_' + dtaAtualUser;

                    const options = {
                        fieldSeparator: ';',
                        quoteStrings: '"',
                        decimalseparator: ',',
                        showLabels: true,
                        showTitle: false,
                        useBom: true,
                        noDownload: false,
                        headers: [
                            'id',
                            'ordem',
                            'centro_id',
                            'centro_nome',
                            'cliente_id',
                            'cliente_nome',
                            'condicao_nome',
                            'dta_referencia',
                            'dta_inclusao',
                            'usuario_inclusao',
                            'tipo_nome',
                            'valor_despesa',
                            'valor_receita',
                            'saldo',
                            'saldo_ant',
                            'venda_id',
                        ],
                    };
                    const data: any[] = [];

                    rw.transactions.forEach((t: ClienteFluxoTransactions) => {
                        const obj = {
                            id: t.id,
                            ordem: t.ordem,
                            centro_id: t.centro_id,
                            centro_nome: t.centro_nome,
                            cliente_id: t.cliente_id,
                            cliente_nome: t.cliente_nome,
                            condicao_nome: t.condicao_nome,
                            dta_referencia: moment(t.dta_referencia).format("DD/MM/YYYY"),
                            dta_inclusao: moment(t.dta_inclusao).format("DD/MM/YYYY HH:mm:ss"),
                            usuario_inclusao: t.usuario_inclusao,
                            tipo_nome: t.tipo_nome,
                            valor_despesa: (t.valor_despesa.toString().replace('.', ',')),
                            valor_receita: (t.valor_receita.toString().replace('.', ',')),
                            saldo: (t.saldo.toString().replace('.', ',')),
                            saldo_ant: (t.saldo_ant.toString().replace('.', ',')),
                            venda_id: t.venda_id
                        };
                        data.push(obj);
                    });

                    const csv = new ngxCsv(data, nameReport, options);
  }
  ngOnInit() {

    this.spinner.show();

    const id = this.route.snapshot.paramMap.get('id');

    this.storageGet(id!)
      .subscribe({
        next: (data: StorageGetClienteFluxoSintetico) => {
          this.pr = data;
          console.log(this.pr);
         

          this.titleService.setTitle('fluxo-cliente-sintetico');
          this.spinner.hide();

          this.storageDelete(id!).subscribe(() => {
            console.log('removing');
          });

        
          this.pr.data.forEach((element) => {
            element.transactions.sort((obj1, obj2) => {
              if (obj1.ordem > obj2.ordem) {
                  return 1;
              }
              if (obj1.ordem < obj2.ordem) {
                  return -1;
              }
              return 0;
          });
          });


          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error: ', error);
          this.spinner.hide();
          this.cdr.detectChanges();
        }
      });
  }


  isUndefined(value: any): boolean {
    return typeof (value) === 'undefined';
  }


  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  
}
