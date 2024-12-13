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
  ItemAlxDescontoDTO,
  ItemAlxPrecoDTO,
  ItemAlxVendDescontoDTO,
  ItemDTO,
} from '@modules/shared/models/item';
import { FuncionarioDTO } from '@modules/shared/models/funcionario';
import { ItemService } from '@modules/shared/services';

@Component({
  selector: 'app-item-preco',
  templateUrl: './item-preco.component.html',
  styleUrls: ['./item-preco.component.scss'],
})
export class ITPrecoComponent implements OnInit {
  ColumnMode = ColumnMode;
  submitted: boolean;
  submittedDesconto = false;
  submittedDescontoVend = false;
  statusForm: number;
  activeNav: any;
  selectionTypeSingle = SelectionType.single;

  itemProcura: ItemDTO | null | undefined;
  item!: ItemDTO | null;
  flgPesquisandoCliente!: number;
  flgPesquisandoEmissor!: number;
  almoxarifados: EstoqueAlmoxarifadoDTO[] = [];
  vendedores: FuncionarioDTO[] | undefined = [];
  itemAlxPrecos: ItemAlxPrecoDTO[] = [];
  itemAlxDescontos: ItemAlxDescontoDTO[] = [];
  itemAlxVendDescontos: ItemAlxVendDescontoDTO[] = [];

  precoAlx!: FormGroup;
  descontoAlx!: FormGroup;
  descontoVendAlx!: FormGroup;

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
    this.submittedDesconto = false;
    this.submittedDescontoVend = false;
    this.statusForm = 1;
    this.searchingItem = false;
    this.searchFailedItem = false;
    this.itemProcura = new ItemDTO();
    this.almoxarifados = [];
    this.vendedores = [];
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
  get fd() {
    return this.descontoAlx.controls;
  }
  get fdv() {
    return this.descontoVendAlx.controls;
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
    this.createForm();
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

    this.vendedores = [];
    this.vendedores = await lastValueFrom(this._itemService.getAllActiveVendedor());
    this.cdr.detectChanges();
  }

  initDefaults(): void {
    this.statusForm = 1;
    this.submitted = false;
    this.submittedDesconto = false;
    this.submittedDescontoVend = false;
  }

  createForm(): void {
    this.precoAlx = new FormGroup({
      estoqueAlmoxarifadoId: new FormControl(null, [Validators.required]),
      vlr: new FormControl(0, [Validators.required, Validators.min(1)]),
      agrupamento: new FormControl(null),
    });
    this.descontoAlx = new FormGroup({
      estoqueAlmoxarifadoId: new FormControl(null, [Validators.required]),
      agrupamento: new FormControl(null, [Validators.required]),
      qtd: new FormControl(0, [Validators.required, Validators.min(1)]),
      percDesc: new FormControl(0, [Validators.required, Validators.min(1)]),
      dtaValidade: new FormControl(null, [Validators.required]),
      vlrDesc: new FormControl(0),
    });
    this.descontoVendAlx = new FormGroup({
      estoqueAlmoxarifadoId: new FormControl(null, [Validators.required]),
      vendedorId: new FormControl(null, [Validators.required]),
      agrupamento: new FormControl(null, [Validators.required]),
      qtd: new FormControl(0, [Validators.required, Validators.min(1)]),
      dtaValidade: new FormControl(null, [Validators.required]),
      percDesc: new FormControl(0, [Validators.required, Validators.min(1)]),
    });
  }

  getVendedorNome(id: number): string {
    const flt = this.vendedores!.filter((vd) => {
      return vd.id == id;
    });
    if (flt.length > 0) {
      return flt[0].nome;
    } else {
      return 'NÃO ENCONTRADO';
    }
  }

  getPrecoCalculadoAutomatico(): number {
    const agpId = this.precoAlx.controls['agrupamento'].value;
    const vlr = this.precoAlx.controls['vlr'].value;

    if (vlr == null || vlr <= 0 || agpId == null || agpId == 0) {
      return 0;
    } else {
      const estAlx = this.item!.itemUnidadeDTOs.filter((it) => {
        return it.id == agpId;
      });
      if (estAlx.length > 0) {
        return vlr * estAlx[0].fator;
      } else {
        return 0;
      }
      
    }
  }

  getVlrUnAlx(): number {
    let precoUn = 0;
    const idAlx = this.descontoAlx.controls['estoqueAlmoxarifadoId'].value;

    if (idAlx != null && idAlx > 0) {
      const fltPrecos = this.itemAlxPrecos.filter((ia) => {
        return ia.estoqueAlmoxarifadoDTO!.id == idAlx;
      });
      if (fltPrecos.length > 0) {
        precoUn = fltPrecos[0].vlr;
      }
    }

    return precoUn;
  }

  getVlrUnAlxVend(): number {
    let precoUn = 0;
    const idAlx = this.descontoVendAlx.controls['estoqueAlmoxarifadoId'].value;

    if (idAlx != null && idAlx > 0) {
      const fltPrecos = this.itemAlxPrecos.filter((ia) => {
        return ia.estoqueAlmoxarifadoDTO!.id == idAlx;
      });
      if (fltPrecos.length > 0) {
        precoUn = fltPrecos[0].vlr;
      }
    }

    return precoUn;
  }

  getVlrUnAlxVendByAlx(idAlx: number): number {
    // console.log(idAlx);
    let precoUn = 0;
    if (idAlx != null && idAlx > 0) {
      const fltPrecos = this.itemAlxPrecos.filter((ia) => {
        return ia.estoqueAlmoxarifadoDTO!.id == idAlx;
      });
      if (fltPrecos.length > 0) {
        precoUn = fltPrecos[0].vlr;
      }
    }

    return precoUn;
  }

  getVlrAGAlx(): number {
    const idAg = this.descontoAlx.controls['agrupamento'].value;
    const fltAg = this.item!.itemUnidadeDTOs.filter((al) => {
      return al.id === idAg;
    });

    if (fltAg != null && fltAg.length > 0 && this.getVlrUnAlx() > 0) {
      return this.getVlrUnAlx() * fltAg[0].fator;
    }

    return 0;
  }

  getVlrAGAlxVend(): number {
    const idAg = this.descontoVendAlx.controls['agrupamento'].value;
    const fltAg = this.item!.itemUnidadeDTOs.filter((al) => {
      return al.id === idAg;
    });

    if (fltAg != null && fltAg.length > 0 && this.getVlrUnAlxVend() > 0) {
      return this.getVlrUnAlxVend() * fltAg[0].fator;
    }

    return 0;
  }

  getVlrAGAlxVendByAgrupamento(idAlx: number, idAg: number): number {
    const fltAg = this.item!.itemUnidadeDTOs.filter((al) => {
      return al.id === idAg;
    });

    if (
      fltAg != null &&
      fltAg.length > 0 &&
      this.getVlrUnAlxVendByAlx(idAlx) > 0
    ) {
      return this.getVlrUnAlxVendByAlx(idAlx) * fltAg[0].fator;
    }

    return 0;
  }

  onKeyVlrDesc(value: any): void {
    if (this.getVlrAGAlx() > 0) {
      const vlr = (1 - value / this.getVlrAGAlx()) * 100;
      this.descontoAlx.controls['percDesc'].setValue(vlr);
    }
  }

  getVlrDescUnAlx(): number {
    const vlrUnit = this.getVlrUnAlx();
    const percDesc = this.descontoAlx.controls['percDesc'].value;
    if (vlrUnit != null && percDesc != null && vlrUnit > 0 && percDesc > 0) {
      return vlrUnit - (percDesc / 100) * vlrUnit;
    } else {
      return 0;
    }
  }

  getVlrDescUnAlxVend(): number {
    const vlrUnit = this.getVlrUnAlxVend();
    const percDesc = this.descontoVendAlx.controls['percDesc'].value;
    if (vlrUnit != null && percDesc != null && vlrUnit > 0 && percDesc > 0) {
      return vlrUnit - (percDesc / 100) * vlrUnit;
    } else {
      return 0;
    }
  }

  getVlrDescAgAlx(): number {
    const vlrAg = this.getVlrAGAlx();
    const percDesc = this.descontoAlx.controls['percDesc'].value;
    if (vlrAg != null && percDesc != null && vlrAg > 0 && percDesc > 0) {
      return vlrAg - (percDesc / 100) * vlrAg;
    } else {
      return 0;
    }
  }

  getVlrDescAgAlxVendByAlxAgrPercDesc(
    idAlx: number,
    idAg: number,
    percDesc: number
  ): number {
    const vlrAg = this.getVlrAGAlxVendByAgrupamento(idAlx, idAg);

    if (vlrAg != null && percDesc != null && vlrAg > 0 && percDesc > 0) {
      return vlrAg - (percDesc / 100) * vlrAg;
    } else {
      return 0;
    }
  }

  getVlrAGTabela(row: ItemAlxVendDescontoDTO): number {
    return this.getVlrAGAlxVendByAgrupamento(
      row.estoqueAlmoxarifadoDTO.id,
      row.itemUnidadeDTO.id
    );
  }

  getVlrDescAGTabela(row: ItemAlxVendDescontoDTO): number {
    return this.getVlrDescAgAlxVendByAlxAgrPercDesc(
      row.estoqueAlmoxarifadoDTO.id,
      row.itemUnidadeDTO.id,
      row.percDesc
    );
  }

  getVlrDescAgAlxVend(): number {
    const vlrAg = this.getVlrAGAlxVend();
    const percDesc = this.descontoVendAlx.controls['percDesc'].value;
    if (vlrAg != null && percDesc != null && vlrAg > 0 && percDesc > 0) {
      return vlrAg - (percDesc / 100) * vlrAg;
    } else {
      return 0;
    }
  }

  getQtdUnCalculadoAutomatico(): number {
    const idAg = this.descontoAlx.controls['agrupamento'].value;
    const qtd = this.descontoAlx.controls['qtd'].value;
    const fltAg = this.item!.itemUnidadeDTOs.filter((al) => {
      return al.id === idAg;
    });
    const agrupameto = fltAg[0];
    if (
      agrupameto != null &&
      qtd != null &&
      agrupameto.fator != null &&
      agrupameto.fator > 0 &&
      qtd > 0
    ) {
      return agrupameto.fator * qtd;
    } else {
      return 0;
    }
  }

  getQtdUnCalculadoAutomaticoVend(): number {
    const idAg = this.descontoVendAlx.controls['agrupamento'].value;
    const qtd = this.descontoVendAlx.controls['qtd'].value;
    const fltAg = this.item!.itemUnidadeDTOs.filter((al) => {
      return al.id === idAg;
    });
    const agrupameto = fltAg[0];
    if (
      agrupameto != null &&
      qtd != null &&
      agrupameto.fator != null &&
      agrupameto.fator > 0 &&
      qtd > 0
    ) {
      return agrupameto.fator * qtd;
    } else {
      return 0;
    }
  }

  selectedItemId(idItem: number): void {
    if (idItem != null && idItem > 0) {
      this._itemService.findById(idItem)
      .subscribe({
        next: (resp: any) => {
            this.itemProcura = resp;
            this.setaItem(this.itemProcura!);
            this.cdr.detectChanges();
          },
          error: () => {
            this.pop(
                'error',
                'ERRO',
                'Erro ao buscar o item, revise o codigo digitado'
              );
          }
      });
    } else {
      this.pop('error', 'ERRO', 'Digite um codigo para procura');
    }
  }
  selectedItem(event: any) {
    // console.log(event);
    this._itemService.findById(event.item.id)
    .subscribe({
        next: (resp: any) => {
            this.itemProcura = resp;
            this.selectedItemId(this.itemProcura!.id);
            this.cdr.detectChanges();
        },
        error: () => {
            this.pop('error', 'ERRO', 'Erro ao buscar o Item.');
        }
    });
  }

  setaItem(item: ItemDTO): void {
    this.item = item;
    this.getItemAlxPrecos(this.item.id);
    this.getItemAlxDescontos(this.item.id);
    this.getItemAlxVendDescontos(this.item.id);
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

  getItemAlxPrecos(itemId: number): void {
    this._itemService.getAllItemAlxPrecos(itemId)
    .subscribe({
        next: (data) => {
            this.spinner.hide('fullSpinner');
            this.itemAlxPrecos = data;
            this.cdr.detectChanges();
        },
        error: (err) => {
            this.spinner.hide('fullSpinner');
            console.log(err);
            this.pop(
              'error',
              'ERRO',
              'Erro ao buscar os preços de itens por almoxarifado'
            );
        }
    });
  }

  getItemAlxVendDescontos(itemId: number): void {
    this._itemService.getItemAlxVendDescontos(itemId)
    .subscribe({
        next: (data) => {
            this.spinner.hide('fullSpinner');
            this.itemAlxVendDescontos = data;
            this.cdr.detectChanges();
        },
        error: (err) => {
            this.spinner.hide('fullSpinner');
            console.log(err);
            this.pop(
              'error',
              'ERRO',
              'Erro ao buscar os descontos de itens por almoxarifado e vendedor'
            );
        }
    });
  }
  getItemAlxDescontos(itemId: number): void {
    this._itemService.getAllItemAlxDescontos(itemId)
    .subscribe({
        next: (data) => {
            this.spinner.hide('fullSpinner');
            this.itemAlxDescontos = data;
            this.cdr.detectChanges();
        },
        error: (err) => {
            this.spinner.hide('fullSpinner');
            console.log(err);
            this.pop(
              'error',
              'ERRO',
              'Erro ao buscar os descontos de itens por almoxarifado'
            );
        }
    });
  }

  onAddPrecoAlx(): void {
    const formValues = this.precoAlx.getRawValue();
    console.log(formValues);
    this.submitted = true;
    if (this.precoAlx.invalid) {
      // console.log(this.getFormValidationErrorsV2(this.pedidoForm));
      // console.log(this.getFormValidationErrorsV2(formCliente));
      this.msgAlerta(
        'Atenção',
        `Existe campos que ainda precisam ser preenchidos`,
        'error'
      );
    } else {
      const precoInclusao = new ItemAlxPrecoDTO();
      precoInclusao.estoqueAlmoxarifadoDTO_id =
        formValues.estoqueAlmoxarifadoId;
      precoInclusao.vlr = formValues.vlr;
      precoInclusao.itemDTO_id = this.item!.id;
      console.log(precoInclusao);

      this.spinner.show('fullSpinner');
      this._itemService.saveItemAlxPrecos(precoInclusao).subscribe({
        next: () => {
          this.pop('success', 'Adicionado com sucesso', '');
          this.getItemAlxPrecos(this.item!.id);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log(err);
          this.spinner.hide('fullSpinner');
          this.pop('error', 'ERRO', 'Erro ao salvar preço');
        },
      });
    }
  }

  onAddDescontoVendAlx(): void {
    const formValues = this.descontoVendAlx.getRawValue();
    this.submittedDescontoVend = true;
    if (this.descontoVendAlx.invalid) {
      // console.log(this.getFormValidationErrorsV2(this.pedidoForm));
      // console.log(this.getFormValidationErrorsV2(formCliente));
      this.msgAlerta(
        'Atenção',
        `Existe campos que ainda precisam ser preenchidos`,
        'error'
      );
    } else {
      const aggr = this.item!.itemUnidadeDTOs.filter((u) => {
        return u.id === formValues.agrupamento;
      });
      const iu = aggr[0];

      const aggrEa = this.almoxarifados.filter((a) => {
        return a.id === formValues.estoqueAlmoxarifadoId;
      });
      const ea = aggrEa[0];

      const descontoInclusao = new ItemAlxVendDescontoDTO();
      descontoInclusao.estoqueAlmoxarifadoDTO_id =
        formValues.estoqueAlmoxarifadoId;
      descontoInclusao.qtd = formValues.qtd;
      descontoInclusao.itemDTO_id = this.item!.id;
      descontoInclusao.itemUnidadeDTO = iu;
      descontoInclusao.itemUnidadeDTO_id = iu.id;
      descontoInclusao.percDesc = formValues.percDesc;
      descontoInclusao.estoqueAlmoxarifadoDTO = ea;
      descontoInclusao.fatorUnidadeOriginal = iu.fator;
      descontoInclusao.qtdConvertido = iu.fator * formValues.qtd;
      descontoInclusao.vendedorId = formValues.vendedorId;
      descontoInclusao.dtaValidade = formValues.dtaValidade;

      console.log(descontoInclusao);

      this.spinner.show('fullSpinner');
      this._itemService.saveItemAlxVendDesconto(descontoInclusao).subscribe({
        next: () => {
          this.pop('success', 'Adicionado com sucesso', '');
          this.getItemAlxVendDescontos(this.item!.id);
          this.submittedDescontoVend = false;
          this.descontoVendAlx.reset();
          this.descontoVendAlx.patchValue({
            estoqueAlmoxarifadoId: null,
            vendedorId: null,
            agrupamento: null,
            vlr: 0,
            percDesc: 0,
          });
          this.descontoVendAlx.enable();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log(err);
          this.spinner.hide('fullSpinner');
          this.pop('error', 'ERRO', 'Erro ao salvar preço');
          this.cdr.detectChanges();
        },
      });
    }
  }

  onAddDescontoAlx(): void {
    const formValues = this.descontoAlx.getRawValue();
    this.submittedDesconto = true;
    if (this.descontoAlx.invalid) {
      // console.log(this.getFormValidationErrorsV2(this.pedidoForm));
      // console.log(this.getFormValidationErrorsV2(formCliente));
      this.msgAlerta(
        'Atenção',
        `Existe campos que ainda precisam ser preenchidos`,
        'error'
      );
    } else {
      const aggr = this.item!.itemUnidadeDTOs.filter((u) => {
        return u.id === formValues.agrupamento;
      });
      const iu = aggr[0];

      const aggrEa = this.almoxarifados.filter((a) => {
        return a.id === formValues.estoqueAlmoxarifadoId;
      });
      const ea = aggrEa[0];

      const descontoInclusao = new ItemAlxDescontoDTO();
      descontoInclusao.estoqueAlmoxarifadoDTO_id =
        formValues.estoqueAlmoxarifadoId;
      descontoInclusao.qtd = formValues.qtd;
      descontoInclusao.itemDTO_id = this.item!.id;
      descontoInclusao.itemUnidadeDTO = iu;
      descontoInclusao.itemUnidadeDTO_id = iu.id;
      descontoInclusao.percDesc = formValues.percDesc;
      descontoInclusao.estoqueAlmoxarifadoDTO = ea;
      descontoInclusao.fatorUnidadeOriginal = iu.fator;
      descontoInclusao.qtdConvertido = iu.fator * formValues.qtd;
      descontoInclusao.dtaValidade = formValues.dtaValidade;

      console.log(descontoInclusao);

      this.spinner.show('fullSpinner');
      this._itemService.saveItemAlxDesconto(descontoInclusao).subscribe({
        next: () => {
          this.pop('success', 'Adicionado com sucesso', '');
          this.getItemAlxDescontos(this.item!.id);
          this.submittedDesconto = false;
          this.descontoAlx.reset();
          this.descontoAlx.patchValue({
            estoqueAlmoxarifadoId: null,
            vendedorId: null,
            agrupamento: null,
            vlr: 0,
            percDesc: 0,
          });
          this.descontoAlx.enable();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log(err);
          this.spinner.hide('fullSpinner');
          this.pop('error', 'ERRO', 'Erro ao salvar preço');
        },
      });
    }
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async onLimpa(): Promise<void> {
    this.onReset();
    await this.iniciaObjs();
    this.pop('success', 'Limpo com sucesso', '');
  }

  onReset() {
    this.submitted = false;
    this.precoAlx.reset();

    this.precoAlx.patchValue({
      estoqueAlmoxarifadoId: null,
      vlr: 0,
    });

    this.precoAlx.enable();

    this.descontoAlx.reset();
    this.descontoAlx.patchValue({
      estoqueAlmoxarifadoId: null,
      agrupamento: null,
      vlr: 0,
      percDesc: 0,
    });
    this.descontoAlx.enable();

    this.descontoVendAlx.reset();
    this.descontoVendAlx.patchValue({
      estoqueAlmoxarifadoId: null,
      vendedorId: null,
      agrupamento: null,
      vlr: 0,
      percDesc: 0,
    });
    this.descontoVendAlx.enable();

    this.item = null;
  }

  removeItemDesconto(row: any): void {
    const activeModal = this._modalService.open(AppItensModalConfirmComponent);
    activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
    activeModal.componentInstance.modalContent =
      'Deseja realmente remover o desconto do item?';
    activeModal.componentInstance.modalType = 'confirm';
    activeModal.componentInstance.defaultLabel = 'Não';
    activeModal.result.then(
      (result) => {
        if (result === 'confirm') {
          this.spinner.show('fullSpinner');
          this._itemService.deleteItemAlxDesconto(row.id)
          .subscribe({
            next: () => {
                this.getItemAlxDescontos(this.item!.id);
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.log(err);
                this.spinner.hide('fullSpinner');
                this.pop('error', 'ERRO', 'Erro ao deletar preço');
                this.cdr.detectChanges();
            }
          });
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  removeItemVendDesconto(row: any): void {
    const activeModal = this._modalService.open(AppItensModalConfirmComponent);
    activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
    activeModal.componentInstance.modalContent =
      'Deseja realmente remover o desconto do item?';
    activeModal.componentInstance.modalType = 'confirm';
    activeModal.componentInstance.defaultLabel = 'Não';
    activeModal.result.then(
      (result) => {
        if (result === 'confirm') {
          this.spinner.show('fullSpinner');
          this._itemService.deleteItemAlxVendDesconto(row.id)
          .subscribe({
            next: () => {
                this.getItemAlxVendDescontos(this.item!.id);
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.log(err);
                this.spinner.hide('fullSpinner');
                this.pop('error', 'ERRO', 'Erro ao deletar preço');
                this.cdr.detectChanges();
            }
          });
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  removeItemPreco(row: any): void {
    const activeModal = this._modalService.open(AppItensModalConfirmComponent);
    activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
    activeModal.componentInstance.modalContent =
      'Deseja realmente remover o preço do item?';
    activeModal.componentInstance.modalType = 'confirm';
    activeModal.componentInstance.defaultLabel = 'Não';
    activeModal.result.then(
      (result) => {
        if (result === 'confirm') {
          this.spinner.show('fullSpinner');
          this._itemService.deleteItemAlxPrecos(row.id)
          .subscribe({
            next: () => {
                this.getItemAlxPrecos(this.item!.id);
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.log(err);
                this.spinner.hide('fullSpinner');
                this.pop('error', 'ERRO', 'Erro ao deletar preço');
                this.cdr.detectChanges();
            }
          });
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  unsetSelected(): void {
    if (this.selected != null) {
      this.selected.splice(0, this.selected.length);
    }
  }
}
