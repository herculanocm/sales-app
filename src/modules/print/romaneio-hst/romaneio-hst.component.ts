import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PrintObjectRota, AgrupamentoVendaAux, AgrupamentoAux, CondicoesVlrAux } from './romaneio-hst.utils';
import { Title } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { RomaneioHstPrintService } from './romaneio-hst.service';

@Component({
  selector: 'app-print-romaneio-hst',
  templateUrl: './romaneio-hst.component.html',
  styleUrls: ['./romaneio-hst.component.scss']
})
export class RomaneioHstPrintComponent implements OnInit {

  dataImpressao: Date;
  pr!: PrintObjectRota;
  agVenda!: AgrupamentoVendaAux[];
  fatorDiv: number;
  hst!: any;

  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    // private _printService: PrintService,
    private spinner: NgxSpinnerService,
    private _rotaV1Service: RomaneioHstPrintService,
    private cdr: ChangeDetectorRef,
  ) {
    this.dataImpressao = new Date();
    this.fatorDiv = 100000;
    this.hst = {};
    this.hst.historicos = [];
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this._rotaV1Service.storageGet(id!)
      .subscribe(async (data) => {
        this.hst = data.data;
        this.hst.historicos.sort((a: { dtaAbertura: number; }, b: { dtaAbertura: number; }) => {
          if (a.dtaAbertura < b.dtaAbertura) {
            return 1;
          }

          if (a.dtaAbertura > b.dtaAbertura) {
            return -1;
          }
          return 0;
        });
        this._rotaV1Service.storageDelete(id!).subscribe(() => {
          console.log('removing');
        });

        this.cdr.detectChanges();
        await this.delay(1000);
        window.print();

        this.cdr.detectChanges();
      });
  }

  isUndefined(value: any): boolean {
    return typeof (value) === 'undefined';
  }

  initAgVendaAux(vendas: any): any {
    const vendaItems: any[] = [];
    const agVenda = [];

    for (let i = 0; i < vendas.length; i++) {
      vendaItems.push(...vendas[i].vendaItemDTOs);
    }

    for (let i = 0; i < vendaItems.length; i++) {
      let existe = false;

      for (let j = 0; j < agVenda.length; j++) {

        if (vendaItems[i].itemDTO.id === agVenda[j].idItem &&
          vendaItems[i].itemUnidadeDTO.id === agVenda[j].idUnidade) {
          agVenda[j].qtd += vendaItems[i].qtd;
          agVenda[j].ordem2 += agVenda[j].fatorUnidade === 1 ? vendaItems[i].qtd / this.fatorDiv : vendaItems[i].qtd;
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
        agVenda.push(obj);
      }
    }
    agVenda.sort((a1, a2) => {
      if (a1.ordem2 > a2.ordem2) {
        return -1;
      }
      if (a1.ordem2 < a2.ordem2) {
        return 1;
      }
      return 0;
    });
    return agVenda;
  }


  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getEnderecoBairroCidade(row: any): string {
    const end = row.logradouroEntrega + ', ' + row.numEntrega +
      ' - ' + row.bairroEntrega + ' - ' + row.municipioEntrega;
    return end;
  }

  iniciaResetaCondicoes(): any {
    const condicoesVlrAux = [];

    const dinheiro = new CondicoesVlrAux();
    dinheiro.ordem = 0;
    dinheiro.nome = 'Dinheiro';
    dinheiro.vlr = 0;

    const boleto = new CondicoesVlrAux();
    boleto.ordem = 1;
    boleto.nome = 'Boleto';
    boleto.vlr = 0;

    const cheque = new CondicoesVlrAux();
    cheque.ordem = 2;
    cheque.nome = 'Cheque';
    cheque.vlr = 0;

    const cartao = new CondicoesVlrAux();
    cartao.ordem = 3;
    cartao.nome = 'Cartão';
    cartao.vlr = 0;

    const pix = new CondicoesVlrAux();
    pix.ordem = 4;
    pix.nome = 'Pix';
    pix.vlr = 0;

    const nota = new CondicoesVlrAux();
    nota.ordem = 5;
    nota.nome = 'Nota';
    nota.vlr = 0;

    const boni = new CondicoesVlrAux();
    boni.ordem = 6;
    boni.nome = 'Bonificação';
    boni.vlr = 0;

    const outros = new CondicoesVlrAux();
    outros.ordem = 7;
    outros.nome = 'Outros';
    outros.vlr = 0;

    condicoesVlrAux.push(dinheiro);
    condicoesVlrAux.push(boleto);
    condicoesVlrAux.push(cheque);
    condicoesVlrAux.push(cartao);
    condicoesVlrAux.push(pix);
    condicoesVlrAux.push(nota);
    condicoesVlrAux.push(boni);
    condicoesVlrAux.push(outros);

    return condicoesVlrAux;
  }

  valoresECondicoes(vendaDTOs: any): any {
    const condicoesVlrAux = this.iniciaResetaCondicoes();

    for (let i = 0; i < vendaDTOs.length; i++) {
      const cond = vendaDTOs[i].condicaoPagamentoDTO.nome.toUpperCase().trim();

      if (cond.indexOf('DINHEIRO') > -1) {
        condicoesVlrAux[0].vlr += vendaDTOs[i].vlrTotal;
      } else if (cond.indexOf('BOLETO') > -1) {
        condicoesVlrAux[1].vlr += vendaDTOs[i].vlrTotal;
      } else if (cond.indexOf('CHEQUE') > -1) {
        condicoesVlrAux[2].vlr += vendaDTOs[i].vlrTotal;
      } else if (cond.indexOf('CARTAO') > -1) {
        condicoesVlrAux[3].vlr += vendaDTOs[i].vlrTotal;
      } else if (cond.indexOf('PIX') > -1) {
        condicoesVlrAux[4].vlr += vendaDTOs[i].vlrTotal;

      } else if (cond.indexOf('NOTA') > -1) {
        condicoesVlrAux[5].vlr += vendaDTOs[i].vlrTotal;
      } else if (cond.indexOf('BONIFICACAO') > -1) {
        condicoesVlrAux[6].vlr += vendaDTOs[i].vlrTotal;
      } else {
        condicoesVlrAux[7].vlr += vendaDTOs[i].vlrTotal;
      }
    }

    return condicoesVlrAux;
  }

  agrupamentos(vendaDTOs: any): any {
    const agrupamentoAux = [];

    for (let i = 0; i < vendaDTOs.length; i++) {
      for (let j = 0; j < vendaDTOs[i].vendaItemDTOs.length; j++) {
        let existe = false;
        for (let x = 0; x < agrupamentoAux.length; x++) {
          if (agrupamentoAux[x].nome.indexOf(vendaDTOs[i].vendaItemDTOs[j].itemUnidadeDTO.nome) > -1) {
            existe = true;
            agrupamentoAux[x].qtd += vendaDTOs[i].vendaItemDTOs[j].qtd;
          }
        }

        if (existe === false) {
          const obj = new AgrupamentoAux();
          obj.nome = vendaDTOs[i].vendaItemDTOs[j].itemUnidadeDTO.nome;
          obj.qtd = vendaDTOs[i].vendaItemDTOs[j].qtd;
          agrupamentoAux.push(obj);
        }
      }
    }
    // console.log(this.agrupamentoAux);
    agrupamentoAux.sort((a, b) => {
      if (a.qtd < b.qtd) {
        return 1;
      }

      if (a.qtd > b.qtd) {
        return -1;
      }

      /*
      if (a.qtd === b.qtd && b.nome == 'UNIDADE') {
          return -1;
      }
      */

      return 0;
    });
    return agrupamentoAux;
  }
}
