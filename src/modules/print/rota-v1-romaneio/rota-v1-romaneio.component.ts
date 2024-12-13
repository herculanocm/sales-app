import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PrintObjectRota, AgrupamentoVendaAux } from './rota-v1-romaneio.utils';
import { Title } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { RotaV1RomaneioService } from './rota-v1-romaneio.service';

@Component({
  selector: 'app-print-rota-v1-romaneio',
  templateUrl: './rota-v1-romaneio.component.html',
  styleUrls: ['./rota-v1-romaneio.component.scss']
})
export class PrintRotav1RomaneioComponent implements OnInit {

  dataImpressao: Date;
  pr!: PrintObjectRota;
  agVenda!: AgrupamentoVendaAux[];
  fatorDiv: number;

  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    // private _printService: PrintService,
    private spinner: NgxSpinnerService,
    private _rotaV1Service: RotaV1RomaneioService,
    private cdr: ChangeDetectorRef,
  ) {
    this.dataImpressao = new Date();
    this.fatorDiv = 100000;
  }

  ngOnInit() {

    this.spinner.show();

    const id = this.route.snapshot.paramMap.get('id');

    this._rotaV1Service.storageGet(id!)
      .subscribe(async (data) => {
        // console.log(data);
        this.pr = data;
        this.initAgVendaAux();

        this.titleService.setTitle('romaneio_id_' + this.pr.data.id);
        this.spinner.hide();

        this._rotaV1Service.storageDelete(id!).subscribe(() => {
          console.log('removing');
        });



        if (!this.isPrintObject()) {
          this.pr = new PrintObjectRota();
          this.pr.id = 'erro';
          this.cdr.detectChanges();
        } else {
          this.cdr.detectChanges();
          await this.delay(1000);
          window.print();
        }

        this.cdr.detectChanges();
      }, (error) => {
        this.spinner.hide();
        this.pr = new PrintObjectRota();
        this.pr.id = 'erro';
        this.cdr.detectChanges();
      });
  }
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  initAgVendaAux(): void {
    const vendaItems: any[] = [];
    this.agVenda = [];

    for (let i = 0; i < this.pr.data.vendaDTOs.length; i++) {
      vendaItems.push(...this.pr.data.vendaDTOs[i].vendaItemDTOs);
    }

    for (let i = 0; i < vendaItems.length; i++) {
      let existe = false;

      for (let j = 0; j < this.agVenda.length; j++) {

        if (vendaItems[i].itemDTO.id === this.agVenda[j].idItem &&
          vendaItems[i].itemUnidadeDTO.id === this.agVenda[j].idUnidade) {
          this.agVenda[j].qtd += vendaItems[i].qtd;
          this.agVenda[j].ordem2 += this.agVenda[j].fatorUnidade === 1 ? vendaItems[i].qtd / this.fatorDiv : vendaItems[i].qtd;
          existe = true;
        }

      }
      if (existe === false) {
        const obj = new AgrupamentoVendaAux();
        obj.idItem = vendaItems[i].itemDTO.id;
        obj.item = vendaItems[i].itemDTO.nome;
        obj.idUnidade = vendaItems[i].itemUnidadeDTO.id;
        obj.unidade = vendaItems[i].itemUnidadeDTO.nome;
        obj.qtd = vendaItems[i].qtd;
        obj.fatorUnidade = vendaItems[i].itemUnidadeDTO.fator;
        obj.ordem2 = vendaItems[i].itemUnidadeDTO.fator === 1 ? vendaItems[i].qtd / this.fatorDiv : vendaItems[i].qtd;
        this.agVenda.push(obj);
      }
    }
    this.agVenda.sort((a1, a2) => {
      if (a1.ordem2 > a2.ordem2) {
        return -1;
      }
      if (a1.ordem2 < a2.ordem2) {
        return 1;
      }
      return 0;
    });

  }
  getEnderecoBairroCidade(row: any): string {
    const end = row.logradouroEntrega + ', ' + row.numEntrega +
      ' - ' + row.bairroEntrega + ' - ' + row.municipioEntrega;
    return end;
  }
  getValorTotalVendas(): number {
    let total = 0;
    for (let i = 0; i < this.pr.data.vendaDTOs.length; i++) {
      total += this.pr.data.vendaDTOs[i].vlrTotal;
    }
    return total;
  }
  isPrintObject(): boolean {
    if (this.pr == null || typeof (this.pr) === 'undefined'
      || this.pr.id == null || this.pr.id.length === 0) {
      return false;
    } else {
      return true;
    }
  }
}
