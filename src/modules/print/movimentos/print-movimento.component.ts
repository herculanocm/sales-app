import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PrintObject } from '../print-utils';
import { PrintMovimentoService } from './print-movimento.service';
import { Title } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { MovimentoDTO } from '@modules/shared/models/movimento';

@Component({
  selector: 'app-print-movimento',
  templateUrl: './print-movimento.component.html',
  styleUrls: ['./print-movimento.component.scss']
})
export class PrintMovimentoComponent implements OnInit {

  printObject!: PrintObject;

  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    private spinner: NgxSpinnerService,
    private _printMovimentoService: PrintMovimentoService,
  ) { }

  ngOnInit() {
    this.spinner.show();
    const id = this.route.snapshot.paramMap.get('id');

    /*
    this.printObject = JSON.parse(localStorage.getItem(id));
    console.log(this.printObject);

    this.printObject.data.movimentoItemDTOs = this.printObject.data.movimentoItemDTOs.sort((obj1, obj2) => {
      if (obj1.ordemInclusaoTimestamp > obj2.ordemInclusaoTimestamp) {
        return 1;
      }
      if (obj1.ordemInclusaoTimestamp < obj2.ordemInclusaoTimestamp) {
        return -1;
      }
      return 0;
    });




    localStorage.removeItem(id);

    if (!this.isPrintObject()) {
      this.printObject = new PrintObject();
      this.printObject.id = 'erro';
    } else {
      window.print();
    }
    */
    this._printMovimentoService.storageGet(id!)
      .subscribe(async (data) => {
        // console.log(data);
        this.printObject = data;

        this.titleService.setTitle('movimento_id_' + id!.toString());

        this.printObject.data.movimentoItemDTOs = this.printObject.data.movimentoItemDTOs.sort((obj1: any, obj2: any) => {
          if (obj1.ordemInclusaoTimestamp > obj2.ordemInclusaoTimestamp) {
            return 1;
          }
          if (obj1.ordemInclusaoTimestamp < obj2.ordemInclusaoTimestamp) {
            return -1;
          }
          return 0;
        });

        this.spinner.hide();

        this._printMovimentoService.storageDelete(id!).subscribe(() => {
          console.log('removing');
        });



        if (!this.isPrintObject()) {
          this.printObject = new PrintObject();
          this.printObject.id = 'erro';
        } else {
          await this.delay(1000);
          window.print();
        }


      }, (error) => {
        this.spinner.hide();
        this.printObject = new PrintObject();
        this.printObject.id = 'erro';
      });


  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  isUndefined(value: any): boolean {
    return typeof (value) === 'undefined';
  }
  fornecedorCliente(mov: MovimentoDTO): string {
    if (mov.fornecedorDTO != null && !this.isUndefined(mov.fornecedorDTO)) {
      return `fornecedor: ${mov.fornecedorDTO!.nome!}`;
    } else if (mov.clienteDTO != null && !this.isUndefined(mov.clienteDTO)) {
      return `cliente: ${mov.clienteDTO!.nome!}`;
    } else {
      return '';
    }
  }
  isPrintObject(): boolean {
    if (this.printObject == null || typeof (this.printObject) === 'undefined'
      || this.printObject.id == null || this.printObject.id.length === 0) {
      return false;
    } else {
      return true;
    }
  }
}
