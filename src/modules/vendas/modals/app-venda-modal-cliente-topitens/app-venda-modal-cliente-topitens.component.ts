import { Component, Input, OnInit } from '@angular/core';
import { ClienteDTO } from '@modules/shared/models/cliente';
import { FuncionarioDTO } from '@modules/shared/models/funcionario';
import { MesAnoFiltros, TopItensCliente } from '@modules/shared/models/generic';
import { VendaService } from '@modules/shared/services';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-venda-modal-cliente-topitens',
    templateUrl: './app-venda-modal-cliente-topitens.component.html',
    styleUrls: ['./app-venda-modal-cliente-topitens.component.scss'],
})
export class AppVendaModalClienteTopItensComponent implements OnInit {
    topItensCliente: TopItensCliente[] = [];
    submitted!: boolean;
    mesAnoProcura!: MesAnoFiltros | null;
    mesAnoFiltros: MesAnoFiltros[] = [];
    flgPesquisando = 0;
    @Input() cliente!: ClienteDTO;
    @Input() vendedor!: FuncionarioDTO;


    constructor(public activeModal: NgbActiveModal, private service: VendaService) {
        this.mesAnoProcura = null;
    }

    isUndefined(value: any): boolean {
        return typeof(value) === 'undefined';
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
    }

    ngOnInit(): void {

        this.getMesAnoFiltros();

        // this.controleTopItens.topItensCliente.sort((it1, it2) => {
        //     if (it1.qtd_compra_total > it2.qtd_compra_total) {
        //         return -1;
        //     }
        //     if (it1.qtd_compra_total < it2.qtd_compra_total) {
        //         return 1;
        //     }
        //     return 0;
        // });

        // let posicao = 1;
        // this.controleTopItens.topItensCliente.forEach(it => {
        //     it.posicaoRank = posicao;
        //     posicao ++;
        // });
    }

    getMesAnoFiltros(): void {
        this.service.getMesAnoFiltros()
            .subscribe({
                next: data => {
                    this.mesAnoFiltros = data;
                    this.mesAnoFiltros.sort((it1, it2) => {
                        if (it1.id > it2.id) {
                            return -1;
                        }
                        if (it1.id < it2.id) {
                            return 1;
                        }
                        return 0;
                    });
                },
                error: err => { console.log(err) }
            });
    }

    onPesquisa(): void {
        this.flgPesquisando = 1;
        this.service.buscaTopItensCliente2(this.cliente.id, this.mesAnoProcura?.id)
            .subscribe({
                next: data => {
                    this.flgPesquisando = 0;
                    this.topItensCliente = data;

                    this.topItensCliente.sort((it1, it2) => {
                        if (it1.qtd_compra_total > it2.qtd_compra_total) {
                            return -1;
                        }
                        if (it1.qtd_compra_total < it2.qtd_compra_total) {
                            return 1;
                        }
                        return 0;
                    });

                    let posicao = 1;
                    this.topItensCliente.forEach(it => {
                        it.posicaoRank = posicao;
                        posicao++;
                    });
                }, error: err => {
                    this.flgPesquisando = 0;
                }
            });
    }

    onChangeMes(event: any): void {
        this.topItensCliente = [];
    }

    compareMesAno(c1: MesAnoFiltros, c2: MesAnoFiltros): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }
}
