import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PrintObjectRota, AgrupamentoVendaAux, CidadeBairroAux, Separador } from './romaneio.utils';
import { Title } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { RomaneioPrintService } from './romaneio.service';

export interface ClienteAuxTable {
  id: number;
  nome: string;
  fantasia: string;
}

@Component({
  selector: 'app-print-romaneio',
  templateUrl: './romaneio.component.html',
  styleUrls: ['./romaneio.component.scss']
})
export class RomaneioPrintComponent implements OnInit {

  dataImpressao: Date;
  pr!: PrintObjectRota;
  agVenda!: AgrupamentoVendaAux[];
  fatorDiv: number;
  separadores: Separador[] = [];
  versaoImpressao = 2;
  cidadeBairros: CidadeBairroAux[] = [];
  clientes: ClienteAuxTable[] = [];

  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    // private _printService: PrintService,
    private spinner: NgxSpinnerService,
    private _rotaV1Service: RomaneioPrintService,
    private cdr: ChangeDetectorRef,
  ) {
    this.dataImpressao = new Date();
    this.fatorDiv = 100000;
  }


  ngOnInit() {

    this.spinner.show();

    const id = this.route.snapshot.paramMap.get('id');

    this._rotaV1Service.storageGet(id!)
      .subscribe({
        next: async (data) => {
          console.log(data);
          this.pr = data;
          this.initAgVendaAux();
          this.initSeparador();

          this.titleService.setTitle('romaneio_id_' + this.pr.data.id);
          this.spinner.hide();

          this._rotaV1Service.storageDelete(id!).subscribe(() => {
            console.log('removing');
          });

          this.pr.data.vendas.vendas.sort((c1: { clienteDTO: { nome: number; }; }, c2: { clienteDTO: { nome: number; }; }) => {
            if (c1.clienteDTO.nome > c2.clienteDTO.nome) {
              return 1;
            }
            if (c1.clienteDTO.nome < c2.clienteDTO.nome) {
              return -1;
            }
            return 0;
          });


          this.cdr.detectChanges();
          if (!this.isPrintObject()) {
            this.pr = new PrintObjectRota();
            this.pr.id = 'erro';
            this.cdr.detectChanges();
          } else {
            this.cdr.detectChanges();
            await this.delay(1000);
            //window.print();
            this.cdr.detectChanges();
          }

          //console.log(this.getCidadeBairro());
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.spinner.hide();
          this.pr = new PrintObjectRota();
          this.pr.id = 'erro';
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

  getPlacaVeiculo(): string {
    if (
      this.pr != null &&
      typeof (this.pr.data) !== 'undefined' &&
      this.pr.data != null &&
      typeof (this.pr.data.veiculoDTO) !== 'undefined' &&
      this.pr.data.veiculoDTO != null &&
      typeof (this.pr.data.veiculoDTO.placa) !== 'undefined' &&
      this.pr.data.veiculoDTO.placa != null
    ) {
      return this.pr.data.veiculoDTO.placa;
    } else {
      return '';
    }
  }

  getCidadeBairro(): void {

    const vendas: any = this.pr.data.vendas.vendas;
    const cidadeBairros: CidadeBairroAux[] = [];
    vendas.forEach((v: any) => {
      const cidadeBairro: CidadeBairroAux = {
        cidade: v.municipioEntrega,
        bairro: v.bairroEntrega
      };
      cidadeBairros.push(cidadeBairro);
    });

    const uniqueValues = new Set<string>();

    // Filter the array to include only distinct values
    this.cidadeBairros = cidadeBairros.filter((item) => {
      const key = `${item.cidade}-${item.bairro}`;

      if (!uniqueValues.has(key)) {
        uniqueValues.add(key);
        return true;
      }

      return false;
    });


    this.cidadeBairros.sort((a, b) => {
      // Compare by cidade first
      const cidadeComparison = a.cidade.localeCompare(b.cidade);

      // If cidade is the same, compare by bairro
      if (cidadeComparison === 0) {
        return a.bairro.localeCompare(b.bairro);
      }

      return cidadeComparison;
    });
  }

  imprimirPagina(): void {
    window.print();
  }

  initSeparador(): void {
    const vendas: any = this.pr.data.vendas.vendas;
    const vendaItems: any[] = [];

    vendas.forEach((vd: any) => {
      let existe = false;
      this.clientes.forEach(cl => {
        if (vd.clienteDTO.id === cl.id) {
          existe = true;
        }
      });
      if (!existe) {
        this.clientes.push({
          id: vd.clienteDTO.id,
          nome: vd.clienteDTO.nome,
          fantasia: vd.clienteDTO.fantasia
        });
      }
    });

    vendas.forEach((v: any) => {
      v.vendaItemDTOs.forEach((it: any) => {
        vendaItems.push(it);
      });
    });

    vendaItems.forEach(vi => {
      let existe = false;
      this.separadores.forEach(s => {
        if (vi.itemDTO.itemSeparadorDTO?.id === s.id) {
          existe = true;
        }
      });
      if (
        !existe &&
        typeof (vi.itemDTO.itemSeparadorDTO) !== 'undefined' &&
        vi.itemDTO.itemSeparadorDTO !== null &&
        vi.itemDTO.itemSeparadorDTO.id > 0
      ) {
        this.separadores.push({
          id: vi.itemDTO.itemSeparadorDTO?.id,
          nome: vi.itemDTO.itemSeparadorDTO?.nome,
          agrupamentos: [],
        });
      }
    });

    this.separadores.push({
      id: 10001,
      nome: 'SEPARADOR DIVERSOS',
      agrupamentos: []
    });

    vendaItems.forEach(vi => {
      let existeSeparador = false;
      this.separadores.forEach(sp => {
        if (
          typeof (vi.itemDTO.itemSeparadorDTO) !== 'undefined' &&
          vi.itemDTO.itemSeparadorDTO !== null &&
          vi.itemDTO.itemSeparadorDTO.id === sp.id) {

          let existe = false;
          sp.agrupamentos.forEach(ag => {
            if (ag.idItem === vi.itemDTO.id && ag.idUnidade === vi.itemUnidadeDTO.id) {
              ag.qtd += vi.qtd;
              ag.ordem2 += ag.fatorUnidade === 1 ? vi.qtd / this.fatorDiv : vi.qtd;
              existe = true;
            }
          });

          if (existe === false) {
            const obj = new AgrupamentoVendaAux();
            obj.idItem = vi.itemDTO.id;
            obj.item = vi.itemDTO.nome;
            obj.idUnidade = vi.itemUnidadeDTO.id;
            obj.unidade = vi.itemUnidadeDTO.nome;
            obj.qtd = vi.qtd;
            obj.fatorUnidade = vi.itemUnidadeDTO.fator;
            obj.ordem2 = vi.itemUnidadeDTO.fator === 1 ? vi.qtd / this.fatorDiv : vi.qtd;
            obj.rua = (vi.itemDTO.itemRuaDTO != null ? vi.itemDTO.itemRuaDTO.nome : '');
            obj.predio = (vi.itemDTO.itemPredioDTO != null ? vi.itemDTO.itemPredioDTO.nome : '');
            obj.nivel = (vi.itemDTO.itemNivelDTO != null ? vi.itemDTO.itemNivelDTO.nome : '');
            sp.agrupamentos.push(obj);
          }

          existeSeparador = true;
        }
      });

      if (existeSeparador === false) {
        this.separadores.forEach(sp => {
          if (sp.id === 10001) {

            let existe = false;
            sp.agrupamentos.forEach(ag => {
              if (ag.idItem === vi.itemDTO.id && ag.idUnidade === vi.itemUnidadeDTO.id) {
                ag.qtd += vi.qtd;
                ag.ordem2 += ag.fatorUnidade === 1 ? vi.qtd / this.fatorDiv : vi.qtd;
                existe = true;
              }
            });

            if (existe === false) {
              const obj = new AgrupamentoVendaAux();
              obj.idItem = vi.itemDTO.id;
              obj.item = vi.itemDTO.nome;
              obj.idUnidade = vi.itemUnidadeDTO.id;
              obj.unidade = vi.itemUnidadeDTO.nome;
              obj.qtd = vi.qtd;
              obj.fatorUnidade = vi.itemUnidadeDTO.fator;
              obj.ordem2 = vi.itemUnidadeDTO.fator === 1 ? vi.qtd / this.fatorDiv : vi.qtd;
              obj.rua = (vi.itemDTO.itemRuaDTO != null ? vi.itemDTO.itemRuaDTO.nome : '');
              obj.predio = (vi.itemDTO.itemPredioDTO != null ? vi.itemDTO.itemPredioDTO.nome : '');
              obj.nivel = (vi.itemDTO.itemNivelDTO != null ? vi.itemDTO.itemNivelDTO.nome : '');
              sp.agrupamentos.push(obj);
            }

          }
        });
      }
    });

    for (let i = 0; i < this.separadores.length; i++) {
      if (this.separadores[i].id === 10001 &&
        this.separadores[i].agrupamentos.length === 0
      ) {
        this.separadores.splice(i, 1);
        i = 9000;
      }
    }

    this.separadores.forEach(sp => {
      sp.agrupamentos.sort((a1, a2) => {
        if (a1.ordem2 > a2.ordem2) {
          return -1;
        }
        if (a1.ordem2 < a2.ordem2) {
          return 1;
        }
        return 0;
      });
    });

    this.separadores.sort((a1, a2) => {
      if (a1.id < a2.id) {
        return -1;
      }
      if (a1.id > a2.id) {
        return 1;
      }
      return 0;
    });

    //console.log(this.separadores);
    this.getCidadeBairro();
  }



  initAgVendaAux(): void {
    const vendaItems: any[] = [];
    this.agVenda = [];

    for (let i = 0; i < this.pr.data.vendas.vendas.length; i++) {
      vendaItems.push(...this.pr.data.vendas.vendas[i].vendaItemDTOs);
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
    for (let i = 0; i < this.pr.data.vendas.vendas.length; i++) {
      total += this.pr.data.vendas.vendas[i].vlrTotal;
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
