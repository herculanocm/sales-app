import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, lastValueFrom, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  tap,
  switchMap,
} from 'rxjs/operators';
import { EstoqueAlmoxarifadoService } from '../../estoques/estoque-almoxarifado/estoque-almoxarifado.service';
import { EstoqueAlmoxarifadoDTO } from '../../estoques/estoque-almoxarifado/estoque-almoxarifado';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { AppItensModalConfirmComponent } from '../modals/app-itens-modal-confirm/app-itens-modal-confirm.component';
import { ToastrService } from 'ngx-toastr';
import {
  ItemDTO,
} from '@modules/shared/models/item';
import { ItemService } from '@modules/shared/services';

@Component({
  selector: 'app-precificacao-auto',
  templateUrl: './precificacao-auto.component.html',
  styleUrls: ['./precificacao-auto.component.scss'],
})
export class PrecificacaoAutoComponent implements OnInit {
  ColumnMode = ColumnMode;
  submitted: boolean;
  statusForm: number;
  activeNav: any;
  selectionTypeSingle = SelectionType.single;

  itemProcura: ItemDTO | null | undefined;
  item!: ItemDTO | null;
  flgPesquisandoCliente!: number;
  flgPesquisandoEmissor!: number;
  almoxarifados: EstoqueAlmoxarifadoDTO[] = [];



  precoAlx = new FormGroup({
    itemId: new FormControl<number | null>(null, [Validators.required]),
    itemNome: new FormControl<string | null>(null),

    alxEntradaId: new FormControl<number | null>(null, [Validators.required]),
    alxPrecoId: new FormControl<number | null>(null, [Validators.required]),

    dtaInicial: new FormControl<Date | null>(null, [Validators.required]),
    dtaFinal: new FormControl<Date | null>(null, [Validators.required]),

    flgDiario: new FormControl<boolean | null>(true),
    flgSemanal: new FormControl<boolean | null>(null),
    flgMensal: new FormControl<boolean | null>(null),
  });


  selected: any[] = [];

  selectedItemPreco: any[] = [];
  selectedItemDesconto: any[] = [];
  selectedItemVendDesconto: any[] = [];

  /* Searching variables */
  searchingItem: boolean;
  searchFailedItem: boolean;

  constructor(
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private _modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private _itemService: ItemService,
    private _estoqueAlmoxarifado: EstoqueAlmoxarifadoService
  ) {
    this.submitted = false;
    this.statusForm = 1;
    this.searchingItem = false;
    this.searchFailedItem = false;
    this.itemProcura = new ItemDTO();
    this.almoxarifados = [];
  }

  /* formatter */
  formatterItem = (x: { nome: string }) => x.nome;

  /* Serach Observable */
  searchItem = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.searchingItem = true)),
      switchMap((term) =>
        this._itemService.findByName(term).pipe(
          tap(() => (this.searchFailedItem = false)),
          catchError(() => {
            this.searchFailedItem = true;
            return of([]);
          })
        )
      ),
      tap(() => (this.searchingItem = false))
    );

  get f() {
    return this.precoAlx.controls;
  }
 
  pop(tipo: string, titulo: string, msg: string): void {
    if (tipo === 'error') {
      this.toastr.error(msg, titulo);
    } else if (tipo === 'success') {
      this.toastr.success(msg, titulo);
    } else if (tipo === 'warning') {
      this.toastr.warning(msg, titulo);
    } else {
      this.toastr.info(msg, titulo);
    }
  }

  isUndefined(value: any): boolean {
    return typeof value === 'undefined';
  }

  ngOnInit(): void {
    this.iniciaObjs();
  }

  async iniciaObjs(): Promise<void> {
    this.initDefaults();

    this.itemProcura = new ItemDTO();

    this.almoxarifados = [];
    const alxs = await lastValueFrom(this._estoqueAlmoxarifado.getAll());

    this.almoxarifados = alxs!.filter((alx) => {
      return alx.apareceVendas == true;
    });


    this.cdr.detectChanges();
  }

  initDefaults(): void {
    this.statusForm = 1;
    this.submitted = false;
  }

  selectedItemId(idItem: number): void {
    if (idItem != null && idItem > 0) {
      this._itemService.findById(idItem).subscribe({
        next: (resp: any) => {
          this.itemProcura = resp;

        },
        error: () => {
          this.pop(
            'error',
            'ERRO',
            'Erro ao buscar o item, revise o codigo digitado'
          );
        },
      });
    } else {
      this.pop('error', 'ERRO', 'Digite um codigo para procura');
    }
  }
  selectedItem(event: any) {
    // console.log(event);
    this._itemService.findById(event.item.id).subscribe({
      next: (resp: any) => {
        this.itemProcura = resp;
        this.selectedItemId(this.itemProcura!.id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.pop('error', 'ERRO', 'Erro ao buscar o Item.');
      },
    });
  }

  msgAlerta(titulo: string, conteudo: string, tipo: string): void {
    const activeModal = this._modalService.open(AppItensModalConfirmComponent, {
      backdrop: true,
    });
    activeModal.componentInstance.modalHeader = titulo;
    activeModal.componentInstance.modalContent = conteudo;
    activeModal.componentInstance.modalType = tipo;
    activeModal.result.then(
      (result) => {
        console.log(result);
      },
      (error) => {
        console.log(error);
      }
    );
  }


  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }


  unsetSelected(): void {
    if (this.selected != null) {
      this.selected.splice(0, this.selected.length);
    }
  }
}
