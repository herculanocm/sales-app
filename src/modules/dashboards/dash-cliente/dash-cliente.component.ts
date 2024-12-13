import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DashboardsService } from '../dashboards.service';
import { ClientesCadastradosChartAux } from '../dashboard.utils';
import { LegendPosition } from '@swimlane/ngx-charts';

@Component({
    selector: 'app-dash-cliente',
    templateUrl: './dash-cliente.component.html',
    styleUrls: ['./dash-cliente.component.scss'],
})
export class DashClienteComponent implements OnInit {

    public chart: any;
    @ViewChild('baseChartId') baseChartId: ElementRef | undefined;
    qtdClientes = 0;
    qtdFuncionarios = 0;
    qtdItens = 0;

    legendPosition = LegendPosition.Below;

    clientesCadastrados!: ClientesCadastradosChartAux;


    single: any[] | undefined;
    multi: any[] | undefined;

    resultsClientesVsAtivos: any[] | undefined;
    resultsDividaAcumulada: any[] | undefined;

    view: any[] = [700, 400];

    // options
    showXAxis = true;
    showYAxis = true;
    gradient = false;
    showLegend = true;
    showXAxisLabel = false;
    xAxisLabel = 'Mes';
    showYAxisLabel = false;
    yAxisLabel = 'Cadastro de Cliente';

    colorScheme = {
        domain: ['#0d6efd']
    };
    colorScheme2 = {
        domain: ['#198754', '#0d6efd']
    };
    colorScheme3 = {
        domain: ['#198754', '#0d6efd','#ffc107']
    };
    



    constructor(
        private _service: DashboardsService,
        private cdr: ChangeDetectorRef,
    ) { }

    
    ngOnInit(): void {
        //this.createChart();
        this.getQtdClientes();
        this.getQtdFuncionarios();
        this.getQtdItens();
        this.getClientesCadastros();
        this.getClientesVsAtivos();
        this.getDividaAcumulada();
    }

    getQtdClientes(): void {
        this._service.getQtdClientes()
            .subscribe({
                next: data => {
                    this.qtdClientes = data[0].qtd;
                    this.cdr.detectChanges();
                }
            });
    }

    getQtdFuncionarios(): void {
        this._service.getQtdFuncionarios()
            .subscribe({
                next: data => {
                    this.qtdFuncionarios = data[0].qtd;
                    this.cdr.detectChanges();
                }
            });
    }

    getQtdItens(): void {
        this._service.getQtdItens()
            .subscribe({
                next: data => {
                    this.qtdItens = data[0].qtd;
                    this.cdr.detectChanges();
                }
            });
    }

    getClientesCadastros(): void {
        this._service.getClientesCadastros()
            .subscribe({
                next: data => {
                    const valores: any[] | undefined = [];
                    data.forEach(dt => {
                        valores.push({
                            name: dt.anomes,
                            value: dt.qtd_cliente
                        });
                    });
                    this.single = valores;
                    this.cdr.detectChanges();
                }
            });
    }

    getClientesVsAtivos(): void {
        this._service.getClientesVsAtivos()
            .subscribe({
                next: data => {
                    this.resultsClientesVsAtivos = data;
                }
            });
    }

    getDividaAcumulada(): void {
        this._service.getDividaAcumulada()
            .subscribe({
                next: data => {
                    this.resultsDividaAcumulada = data;
                }
            });
    }

}
