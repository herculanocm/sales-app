import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ValidationErrors,
} from '@angular/forms';
import {
  ClienteDTO
} from '@modules/shared/models/cliente';
import { FuncionarioDTO } from '@modules/shared/models/funcionario';
import {
  EstoqueAlmoxarifadoDTO,
  ItemDTO,
  ItemImagemDTO,
  ItemUnidadeDTO,
} from '@modules/shared/models/item';
import {
  VendaDTO,
  VendaItemDTO,
  VendaStatusLabelDTO,
} from '@modules/shared/models/venda';
import {
  ClienteService,
  CondicaoPagamentoService,
  ConfGeraisService,
  EstoqueAlmoxarifadoService,
  FuncionarioService,
  ItemService,
  VendaService,
} from '@modules/shared/services';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import 'moment/locale/pt-br';
import { BehaviorSubject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalPdvItemComponent } from '../modal-pdv-item/modal-pdv-item.component';
import { ModalPdvItemRemoveComponent } from '../modal-pdv-item-remove/modal-pdv-item-remove.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { CurrentUserSalesAppAux } from '@modules/shared/models/generic';
import { ModalVendasAlertComponent } from '../modal-alert/modal-alert.component';
import { ModalVendasConfirmComponent } from '../modal-confirm/modal-confirm.component';
import { Router } from '@angular/router';
import { ConfGeraisDTO } from '@modules/shared/models/configuracoes';
import { CondicaoPagamentoDTO } from '@modules/shared/models/condicao-pagamento';

@Component({
  selector: 'app-pdv',
  templateUrl: './pdv.component.html',
  styleUrls: ['./pdv.component.scss'],
})
export class PdvComponent implements OnInit, AfterViewInit {
  submitted = false;
  submittedItem = false;
  activeNav = 1;
  confGerais!: ConfGeraisDTO;

  @ViewChild('itemId')
  itemId: ElementRef | undefined;

  @ViewChild('itemCodBarras')
  itemCodBarras: ElementRef | undefined;

  @ViewChild('estoqueAlmoxarifado')
  estoqueAlmoxarifado: ElementRef | undefined;

  @ViewChild('itemAgrupamento')
  itemAgrupamento: ElementRef | undefined;

  pdvForm = new FormGroup({
    id: new FormControl<number | null>(null),
    vlrTotal: new FormControl<number>(0),
    vendedor: new FormControl<FuncionarioDTO | null>(null, [
      Validators.required,
    ]),
    estoqueAlmoxarifadoId: new FormControl<number | null>(null, [
      Validators.required,
    ]),
    condicaoPagamento: new FormControl<CondicaoPagamentoDTO | null>(null, [
      Validators.required,
    ]),
    clienteId: new FormControl<number | null>(null, [Validators.required]),
    clienteNome: new FormControl<string | null>(null, [Validators.required]),
    clienteDTO: new FormControl<ClienteDTO | null>(null, [Validators.required]),
    dtaEmissao: new FormControl<Date | string | null>(null, [
      Validators.required,
    ]),
    dtaEntrega: new FormControl<Date | string | null>(null, [
      Validators.required,
    ]),

    itemForm: new FormGroup({
      id: new FormControl<number | null>(null),
      codigoBarras: new FormControl<string | null>(null),
      nome: new FormControl<string | null>(null),
      idAux: new FormControl<number | null>(null),
      nomeTypeahead: new FormControl<string | null>(''),
      agrupamento: new FormControl<ItemUnidadeDTO | null>(null),
      qtd: new FormControl<number | null>(null),
      vlr: new FormControl<number | null>(null),
      perc: new FormControl<number | null>(0),
      vlrAg: new FormControl<number | null>(0),
      item: new FormControl<ItemDTO | null>(null),
      estoqueUn: new FormControl<number | null>(null),
      vlrUn: new FormControl<number | null>(null),
      estoqueUnAp: new FormControl<number>(0),
      vlrUnAp: new FormControl<number>(0),
    }),
  });

  condicaoPagamentosVisiveis: CondicaoPagamentoDTO[] = [];
  vendedoresVisiveis: FuncionarioDTO[] = [];
  estoqueAlmoxarifados: EstoqueAlmoxarifadoDTO[] = [];

  estoqueFiltrados: EstoqueAlmoxarifadoDTO[] = [];
  currentUserSalesApp: CurrentUserSalesAppAux = JSON.parse(
    sessionStorage.getItem('currentUserSalesApp')!
  );

  vendaItems: VendaItemDTO[] = [];
  vendaItems$ = new BehaviorSubject<VendaItemDTO[]>(this.vendaItems);

  constructor(
    private _hotkeysService: HotkeysService,
    private _clienteService: ClienteService,
    private _itemService: ItemService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private _vendaService: VendaService,
    private _estoqueAlmoxarifado: EstoqueAlmoxarifadoService,
    private _funcionarioService: FuncionarioService,
    private _condicaoPagamentoService: CondicaoPagamentoService,
    private _modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private router: Router,
    private _confService: ConfGeraisService,
  ) {
    // console.log(this.currentUserSalesApp);
    this._hotkeysService.add(
      new Hotkey('f1', (event: KeyboardEvent): boolean => {
        this.estoqueAlmoxarifado?.nativeElement.focus();
        return false; // Prevent bubbling
      })
    );
    this._hotkeysService.add(
      new Hotkey('f2', (event: KeyboardEvent): boolean => {
        this.onClearItem();
        return false; // Prevent bubbling
      })
    );

    this._hotkeysService.add(
      new Hotkey('f3', (event: KeyboardEvent): boolean => {
        this.onClearItemWithVendaItems();
        return false; // Prevent bubbling
      })
    );

    this._hotkeysService.add(
      new Hotkey('f4', (event: KeyboardEvent): boolean => {
        //this.onClear();
        return false; // Prevent bubbling
      })
    );

    this._hotkeysService.add(
      new Hotkey('f5', (event: KeyboardEvent): boolean => {
        this.openSearchItem();
        return false; // Prevent bubbling
      })
    );

    this._hotkeysService.add(
      new Hotkey('f6', (event: KeyboardEvent): boolean => {
        this.openRemoveItem();
        return false; // Prevent bubbling
      })
    );

    this._hotkeysService.add(
      new Hotkey('f11', (event: KeyboardEvent): boolean => {
        this.addItem();
        return false; // Prevent bubbling
      })
    );

    this._hotkeysService.add(
      new Hotkey('f12', (event: KeyboardEvent): boolean => {
        this.enviaVenda();
        return false; // Prevent bubbling
      })
    );
  }
  ngAfterViewInit(): void {
    this.estoqueAlmoxarifado?.nativeElement.focus();
  }

  getConfiguracaoGeral(): void {
    this._confService.getConfById(1).subscribe({
      next: (data) => {
        this.confGerais = data;
      },
      error: (err) => {
        console.log(err);
      },
    });
  
  }

  onKeyDown(event: KeyboardEvent, origem: string): void {
    //console.log(event);
    if (event.key.toUpperCase() === 'ENTER') {
      if (origem === 'searchItem') {
        this.findItemById();
        event.preventDefault();
        event.stopPropagation();
      }
    } else if (event.key.toUpperCase() === 'TAB') {
      if (origem === 'searchItem') {
        this.findItemById();
        event.preventDefault();
        event.stopPropagation();
      }
    } else if (event.key.toUpperCase() === 'F1') {
      this.estoqueAlmoxarifado?.nativeElement.focus();

      event.preventDefault();
      event.stopPropagation();
    } else if (event.key.toUpperCase() === 'F2') {
      this.onClearItem();

      event.preventDefault();
      event.stopPropagation();
    } else if (event.key.toUpperCase() === 'F3') {
      this.onClearItemWithVendaItems();

      event.preventDefault();
      event.stopPropagation();
    } else if (event.key.toUpperCase() === 'F4') {
      //this.onClear();

      event.preventDefault();
      event.stopPropagation();
    } else if (event.key.toUpperCase() === 'F5') {
      this.openSearchItem();

      event.preventDefault();
      event.stopPropagation();
    } else if (event.key.toUpperCase() === 'F6') {
      this.openRemoveItem();

      event.preventDefault();
      event.stopPropagation();
    } else if (event.key.toUpperCase() === 'F11') {
      this.addItem();

      event.preventDefault();
      event.stopPropagation();
    } else if (event.key.toUpperCase() === 'F12') {
      this.enviaVenda();

      event.preventDefault();
      event.stopPropagation();
    }
  }

  calcularVlrTotalItem(): void {
    const formItem = this.pdvForm.get('itemForm') as FormGroup;
    const values = formItem.getRawValue();
    const newValue = values.qtd * values.vlrUn;
    formItem.patchValue({
      vlr: newValue,
    });
    this.cdr.markForCheck();
  }

  isNumber(value: any): boolean {
    const numValue = Number(value);
    return !isNaN(numValue);
  }

  ngOnInit(): void {
    this.resetForm();
    this.findClienteById();
    this.getAllCondicoes();
    this.getAllVendedores();
    this.getAllEstoqueAlmoxarifado();
    this.getConfiguracaoGeral();

    const formItem = this.pdvForm.get('itemForm') as FormGroup;
    formItem.get('qtd')!.valueChanges.subscribe((v) => {
      this.changeQtd();
    });

    this.vendaItems$.subscribe((items) => {
      let total = 0;
      items.forEach((item) => {
        total += item.vlr;
      });
      this.pdvForm.patchValue({
        vlrTotal: this.roundVlrTotal(total, 2),
      });
      this.cdr.markForCheck();
    });
  }

  roundVlrTotal(total: number, decimalPlaces: number): number {
    return parseFloat(total.toFixed(decimalPlaces));
  }

  changeQtd(): void {
    const formItem = this.pdvForm.get('itemForm') as FormGroup;
    const values = formItem.getRawValue();

    let fator = 1;

    if (
      values.agrupamento !== null &&
      values.agrupamento.fator !== null &&
      values.agrupamento.fator > 0
    ) {
      fator = values.agrupamento.fator;
    }

    const newValue = values.qtd * fator * values.vlrUn;
    formItem.patchValue({
      vlr: this.roundVlrTotal(newValue, 2),
      estoqueUnAp: values.estoqueUn / fator,
      vlrUnAp: this.roundVlrTotal(fator * values.vlrUn, 2),
    });
    this.cdr.markForCheck();
  }

  onClear(): void {
    this.pdvForm.reset();
    this.resetForm();
    this.vendaItems = [];

    this.resetForm();
    this.estoqueAlmoxarifado?.nativeElement.focus();
    this.cdr.markForCheck();
  }

  openSearchItem(): void {
    const activeModal = this._modalService.open(ModalPdvItemComponent, {
      size: 'lg',
      scrollable: true,
      backdrop: true,
    });
    activeModal.result.then(
      (result) => {
        if (result !== null && this.isUndefined(result) === false) {
          this.selectItemByCod(result.id);
        }
      },
      (error) => {
        console.log(error);
        this.estoqueAlmoxarifado?.nativeElement.focus();
      }
    );
  }

  openRemoveItem(): void {
    const activeModal = this._modalService.open(ModalPdvItemRemoveComponent, {
      size: 'sm',
    });
    activeModal.result.then(
      (result) => {
        if (
          result !== null &&
          this.isUndefined(result) === false &&
          Number(result) > 0
        ) {
          for (let i = 0; i < this.vendaItems.length; i++) {
            if (i + 1 === Number(result)) {
              this.vendaItems.splice(i, 1);
              this.vendaItems = [...this.vendaItems];
              this.vendaItems$.next(this.vendaItems);
              this.toastr.success('Item removido', '');
              break;
            }
          }
        }
      },
      (error) => {
        console.log(error);
        this.estoqueAlmoxarifado?.nativeElement.focus();
      }
    );
  }

  resetForm(): void {
    this.pdvForm.controls.clienteNome.disable();
    this.pdvForm.controls.vlrTotal.disable();
    this.pdvForm.patchValue({
      dtaEmissao: this.convertDate(new Date(), 0),
      dtaEntrega: this.addDayDateToString(new Date(), 1),
      clienteId: 1,
    });

    const formItem = this.pdvForm.get('itemForm') as FormGroup;
    formItem.controls['vlrUnAp'].disable();
    formItem.controls['estoqueUnAp'].disable();
  }

  onClearItem(): void {
    this.submittedItem = false;
    const formItem = this.pdvForm.get('itemForm') as FormGroup;
    formItem.reset();
    this.removeValidatorsItem();
    this.cdr.markForCheck();

    this.getConfiguracaoGeral();

    this.itemId?.nativeElement.focus();
  }

  onClearItemWithVendaItems(): void {
    this.submittedItem = false;
    const formItem = this.pdvForm.get('itemForm') as FormGroup;
    formItem.reset();
    this.vendaItems = [];
    this.cdr.markForCheck();
  }

  addItem(): void {
    this.submittedItem = true;
    this.submitted = true;
    const pdvFormValues = this.pdvForm.getRawValue();
    const formItem = this.pdvForm.get('itemForm') as FormGroup;
    const formValues = formItem.getRawValue();
    if (formItem.invalid) {
      console.log('invalid');
      this.toastr.warning('Preencha os campos obrigatórios', 'Atenção');
    } else {
      console.log('addding item', formValues);
      const itemDTO = formValues.item as ItemDTO;
      const estoqueAlmoxarifado = this.estoqueAlmoxarifados.find(
        (e) => e.id === pdvFormValues.estoqueAlmoxarifadoId
      );

      console.log(
        formValues.vlrUn * (formValues.qtd * formValues.agrupamento.fator)
      );
      console.log(estoqueAlmoxarifado);

      if (formValues.vlrUn < 1) {
        this.toastr.warning(
          'Valor unitário deve ser maior que 0, selecione outro almoxarifado ou contate o responsável',
          'Atenção'
        );
        return;
      } else if (formValues.estoqueUn === 0) {
        this.toastr.warning(
          'Quantidade de estoque do item está zerado, selecione outro almoxarifado ou contate o responsável',
          'Atenção'
        );
      } else if (
        formValues.qtd * formValues.agrupamento.fator >
        formValues.estoqueUn
      ) {
        this.toastr.warning(
          'Quantidade de estoque do item está menor que o solicitado, selecione outro almoxarifado ou contate o responsável',
          'Atenção'
        );
      } else if (
        this.roundVlrTotal(formValues.vlr, 2) <
        this.roundVlrTotal(
          formValues.vlrUn * (formValues.qtd * formValues.agrupamento.fator),
          2
        )
      ) {
        this.toastr.warning(
          'O valor digitado é menor que o esperado/configurado para o item',
          'Atenção'
        );
      } else {
        const vendaItem = new VendaItemDTO();
        vendaItem.itemDTO = itemDTO;
        vendaItem.qtd = formValues.qtd;
        vendaItem.vlr = formValues.vlr;
        vendaItem.vlrUnitario =
          formValues.vlr / (formValues.qtd * formValues.agrupamento.fator);
        vendaItem.vlrUnitarioOrig =
          formValues.vlr / (formValues.qtd * formValues.agrupamento.fator);
        vendaItem.qtdConvertido = formValues.qtd * formValues.agrupamento.fator;
        vendaItem.vlrDesconto = 0;
        vendaItem.percDesconto = 0;
        vendaItem.vlrOrig = formValues.vlr;
        vendaItem.fatorInclusao = formValues.agrupamento.fator;
        vendaItem.itemUnidadeDTO = formValues.agrupamento;
        vendaItem.estoqueAlmoxarifadoDTO = estoqueAlmoxarifado!;
        vendaItem.estoqueAlmoxarifadoId = estoqueAlmoxarifado!.id;

        this.vendaItems.push(vendaItem);
        this.vendaItems = [...this.vendaItems];
        this.vendaItems$.next(this.vendaItems);
        this.onClearItem();
        this.itemId?.nativeElement.focus();
        this.toastr.success('Item adicionado', '');
        this.cdr.markForCheck();
      }
    }
  }

  setaValidatorsItem(): void {
    const formItem = this.pdvForm.get('itemForm') as FormGroup;
    formItem.controls['agrupamento'].setValidators(Validators.required);
    formItem.controls['qtd'].setValidators([
      Validators.required,
      Validators.min(1),
    ]);
    formItem.controls['vlr'].setValidators([
      Validators.required,
      Validators.min(1),
    ]);
    formItem.controls['item'].setValidators(Validators.required);

    formItem.controls['item'].updateValueAndValidity();
    formItem.controls['agrupamento'].updateValueAndValidity();
    formItem.controls['qtd'].updateValueAndValidity();
    formItem.controls['vlr'].updateValueAndValidity();

    // Trigger change detection
    this.cdr.detectChanges();
  }

  removeValidatorsItem(): void {
    const formItem = this.pdvForm.get('itemForm') as FormGroup;
    formItem.controls['item'].clearValidators();
    formItem.controls['agrupamento'].clearValidators();
    formItem.controls['qtd'].clearValidators();
    formItem.controls['vlr'].clearValidators();

    // Update control validity
    formItem.controls['item'].updateValueAndValidity();
    formItem.controls['agrupamento'].updateValueAndValidity();
    formItem.controls['qtd'].updateValueAndValidity();
    formItem.controls['vlr'].updateValueAndValidity();

    // Trigger change detection
    this.cdr.detectChanges();
  }

  getFormValidationErrors() {
    Object.keys(this.pdvForm.controls).forEach((key) => {
      const controlErrors: ValidationErrors | null =
        this.pdvForm.get(key)!.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach((keyError) => {
          console.log(
            'Key control: ' + key + ', keyError: ' + keyError + ', err value: ',
            controlErrors[keyError]
          );
        });
      }
    });
  }

  getFormValidationErrorsV2(form: FormGroup) {
    const result: any[] = [];
    Object.keys(form.controls).forEach((key) => {
      const controlErrors: ValidationErrors | null = form.get(key)!.errors;
      if (controlErrors) {
        Object.keys(controlErrors).forEach((keyError) => {
          result.push({
            control: key,
            error: keyError,
            value: controlErrors[keyError],
          });
        });
      }
    });

    return result;
  }

  disableItemValidators(formGroup: FormGroup): void {
    const itemFormGroup = formGroup.get('itemForm') as FormGroup;
    Object.keys(itemFormGroup.controls).forEach((controlName) => {
      const control = itemFormGroup.get(controlName);
      if (control) {
        control.clearValidators();
        control.updateValueAndValidity();
      }
    });
  }

  enviaVenda(): void {
    this.submitted = true;
    this.submittedItem = true;
    const formValues = this.pdvForm.getRawValue();
    if (this.vendaItems.length === 0) {
      this.toastr.warning('Adicione itens a venda', 'Atenção');
      return;
    } else if (this.pdvForm.invalid) {
      this.toastr.warning('Preencha os campos obrigatórios', 'Atenção');
      return;
    } else if (
      this.confGerais != null &&
      this.isUndefined(this.confGerais) === false &&
      this.confGerais.vendaBloqueada != null &&
      this.confGerais.vendaBloqueada === true
    ) {
      this.toastr.error('Atualize a página ou contate o time de vendas, o sistema está bloqueado para enviar novos pedidos.', 'Atenção');
    } else {
      this.spinner.show('fullSpinner');
      const vendaDTO = new VendaDTO();
      vendaDTO.clienteDTO = formValues.clienteDTO;
      vendaDTO.condicaoPagamentoDTO = formValues.condicaoPagamento;
      vendaDTO.dtaEmissao = formValues.dtaEmissao;
      vendaDTO.dtaEntrega = formValues.dtaEntrega;
      vendaDTO.vendedorDTO = formValues.vendedor;
      vendaDTO.estoqueAlmoxarifadoDTO = this.estoqueAlmoxarifados.find(
        (e) => e.id === formValues.estoqueAlmoxarifadoId
      );
      vendaDTO.estoqueAlmoxarifadoId = formValues.estoqueAlmoxarifadoId;
      vendaDTO.vlrProdutosSDesconto = 0;
      vendaDTO.vlrProdutosSDescontoCalc = 0;
      vendaDTO.vendaItemDTOs = this.vendaItems;
      vendaDTO.vlrTotal = formValues.vlrTotal ?? 0;
      vendaDTO.vlrProdutos = formValues.vlrTotal ?? 0;
      vendaDTO.descricao = 'Venda realizada pelo PDV - CUPOM';
      vendaDTO.municipioDTO =
        formValues.clienteDTO?.clienteEnderecoDTOs[0]?.municipioDTO || null;
      vendaDTO.logradouroEntrega =
        formValues.clienteDTO?.clienteEnderecoDTOs[0]?.logradouro || null;
      vendaDTO.numEntrega =
        formValues.clienteDTO?.clienteEnderecoDTOs[0]?.numLogradouro || null;
      vendaDTO.bairroEntrega =
        formValues.clienteDTO?.clienteEnderecoDTOs[0]?.bairro || null;
      vendaDTO.cepEntrega =
        formValues.clienteDTO?.clienteEnderecoDTOs[0]?.cep || null;
      vendaDTO.municipioEntrega =
        formValues.clienteDTO?.clienteEnderecoDTOs[0]?.municipioDTO.nome ||
        null;
      vendaDTO.estadoEntrega =
        formValues.clienteDTO?.clienteEnderecoDTOs[0]?.municipioDTO.estadoDTO
          ?.nome || null;

      this._vendaService.postCupomFiscal(vendaDTO).subscribe({
        next: (data) => {
          console.log(data);
          this.spinner.hide('fullSpinner');
          this.toastr.success(
            `Cupom enviado e faturado com sucesso. PreVendaId:  ${data.id}`,
            ''
          );
          this.onClearItem();
          this.submitted = false;
          this.submittedItem = false;
          this.vendaItems = [];
          this.vendaItems$.next(this.vendaItems);
          this.getConfiguracaoGeral();
          this.cdr.markForCheck();

          this.openModalImpressao(data);
        },
        error: (err) => {
          console.log(err);
          this.spinner.hide('fullSpinner');
          this.toastr.error('Erro ao realizar a venda', 'Erro');
          this.cdr.markForCheck();
        },
      });
    }
  }

  openModalImpressao(data: VendaDTO): void {
    const activeModal = this._modalService.open(ModalVendasConfirmComponent);
    activeModal.componentInstance.modalHeader = 'Confirmação';
    activeModal.componentInstance.modalContent = 'Deseja imprimir o cupom?';
    activeModal.componentInstance.textButtonYes = 'Sim';
    activeModal.componentInstance.textButtonNo = 'Não';
    activeModal.result.then(
      (result) => {
        if (result != null && result === 'yes') {
          this.openPrintTermalPage(data);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  openPrintTermalPage(vendaDTO: VendaDTO): void {
    vendaDTO.statusConfirmacao =
      this._vendaService.getUltStatusConfirmacao(vendaDTO);
    vendaDTO.statusAprovacao =
      this._vendaService.getUltStatusAprovado(vendaDTO);
    vendaDTO.statusFaturamento =
      this._vendaService.getUltStatusFaturado(vendaDTO);

    const id = new Date().getTime();
    const key =
      this.currentUserSalesApp.username +
      '_' +
      id.toString() +
      '_' +
      vendaDTO.id;

    const fltEstoque = this.estoqueAlmoxarifados.filter((ea) => {
      return ea.id == vendaDTO.estoqueAlmoxarifadoId;
    });

    if (fltEstoque.length > 0) {
      vendaDTO.estoqueAlmoxarifadoDTO = fltEstoque[0];
    }

    this._vendaService
      .storageSet(key, { id: 'venda', data: vendaDTO })
      .subscribe(
        () => {
          console.log('Deu tudo certo, vamos imprimir');
          const hrefFull =
            this._vendaService.hrefContext() + 'print/venda2/' + key;
          // console.log(hrefFull);
          this.router.navigate([]).then(() => {
            window.open(hrefFull, '_blank');
          });
          this.cdr.markForCheck();
        },
        (error) => {
          console.log(error);
          this.toastr.error(
            'Erro ao tentar imprimir, contate o administrador',
            ''
          );
          console.log(
            'Erro ao tentar imprimir, contate o administrador, não salvou no indexdDB'
          );
          this.cdr.markForCheck();
        }
      );
  }

  getAllImagesforItem(itemId: number): void {
    this._itemService.getImagens(itemId).subscribe({
      next: (itemImageData) => {
        itemImageData.forEach((el) => {
          el.srcImg = 'data:' + el.fileType + ';base64,' + el.imgBase64;
          el.imgBase64 = null;
        });
        const itemDTO = this.getItemDTOSelecionado();
        itemDTO.itemImagemDTOs = [...itemImageData];
        this.setItemDTOForm(itemDTO);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  getAllVendedores(): void {
    this._funcionarioService.getAllActiveVendedor().subscribe({
      next: (data) => {
        this.vendedoresVisiveis = data;

        const flt = this.vendedoresVisiveis.filter((v) => {
          return v.id === 5;
        });

        if (flt.length > 0) {
          this.pdvForm.patchValue({
            vendedor: flt[0],
          });
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  setAlmoxarifadosFiltrados(
    estoqueAlmoxarifados: EstoqueAlmoxarifadoDTO[]
  ): void {

    if (
      estoqueAlmoxarifados.length > 0 &&
      this.currentUserSalesApp != null &&
      this.isUndefined(this.currentUserSalesApp) === false &&
      this.currentUserSalesApp.funcionarioDTO != null &&
      this.isUndefined(this.currentUserSalesApp.funcionarioDTO) === false &&
      this.currentUserSalesApp.funcionarioDTO.estoqueAlmoxarifadoDTOs != null &&
      this.currentUserSalesApp.funcionarioDTO.estoqueAlmoxarifadoDTOs.length > 0 
    ) {
      const almoxarifados =
        this.currentUserSalesApp.funcionarioDTO.estoqueAlmoxarifadoDTOs;
      this.estoqueFiltrados = estoqueAlmoxarifados.filter((alm) => {
        return almoxarifados.some((e) => e.id === alm.id) && alm.apareceVendas === true;
      });

      if (this.estoqueFiltrados.length > 0) {
        this.pdvForm.patchValue({
          estoqueAlmoxarifadoId: this.estoqueFiltrados[0].id,
        });
      }

      this.cdr.markForCheck();
    } else {
      this.estoqueFiltrados = [];
      this.modalAlert(
        'Atenção',
        'Funcionário sem almoxarifado vinculado, contate o time de vendas'
      );
      this.cdr.markForCheck();
    }
  }

  modalAlert(header: string, content: string): void {
    const activeModal = this._modalService.open(ModalVendasAlertComponent);
    activeModal.componentInstance.modalHeader = header;
    activeModal.componentInstance.modalContent = content;
    activeModal.result.then(
      (result) => {
        console.log(result);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getAllEstoqueAlmoxarifado(): void {
    this._estoqueAlmoxarifado.getAllActive().subscribe({
      next: (data) => {
        this.estoqueAlmoxarifados = data;
        this.setAlmoxarifadosFiltrados(data);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  getAllCondicoes(): void {
    this._condicaoPagamentoService.getAllActive().subscribe({
      next: (data) => {
        this.condicaoPagamentosVisiveis = data;

        const flt = this.condicaoPagamentosVisiveis.filter((cp) => {
          return cp.id === 1;
        });

        if (flt.length > 0) {
          this.pdvForm.patchValue({
            condicaoPagamento: flt[0],
          });
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  get f() {
    return this.pdvForm.controls;
  }

  get fi() {
    const formItem = this.pdvForm.get('itemForm') as FormGroup;
    return formItem.controls;
  }

  setItemDTOForm(itemDTO: ItemDTO): void {
    const formItem = this.pdvForm.get('itemForm') as FormGroup;
    formItem.patchValue({
      item: itemDTO,
    });
  }

  isItemSelecionado(): boolean {
    const formItem = this.pdvForm.get('itemForm') as FormGroup;
    const formValues = formItem.getRawValue();
    const itemDTO = formValues.item as ItemDTO;
    return (
      itemDTO !== null &&
      this.isUndefined(itemDTO) === false &&
      itemDTO.id !== null &&
      itemDTO.id > 0
    );
  }

  getImagemItemSelecionado(): ItemImagemDTO[] {
    const itemDTO = this.getItemDTOSelecionado();
    if (
      this.isItemSelecionado() &&
      itemDTO.itemImagemDTOs != null &&
      itemDTO.itemImagemDTOs.length > 0
    ) {
      return itemDTO.itemImagemDTOs;
    } else {
      return [];
    }
  }

  getItemDTOSelecionado(): ItemDTO {
    const formItem = this.pdvForm.get('itemForm') as FormGroup;
    const formValues = formItem.getRawValue();
    const itemDTO = formValues.item as ItemDTO;
    return itemDTO;
  }

  getAllAgrupamentos(): ItemUnidadeDTO[] {
    if (this.isItemSelecionado()) {
      return this.getItemDTOSelecionado().itemUnidadeDTOs;
    } else {
      return [];
    }
  }

  onChangeAlmoxarifado(event: any): void {
    this.vendaItems = [];
  }

  compareVendedor(v1: FuncionarioDTO, v2: FuncionarioDTO): boolean {
    return v1 && v2 ? v1.id === v2.id : v1 === v2;
  }
  compareCondicaoPagamento(
    v1: CondicaoPagamentoDTO,
    v2: CondicaoPagamentoDTO
  ): boolean {
    return v1 && v2 ? v1.id === v2.id : v1 === v2;
  }

  compareStatus(s1: VendaStatusLabelDTO, s2: VendaStatusLabelDTO): boolean {
    return s1 && s2 ? s1.sigla === s2.sigla : s1 === s2;
  }

  addDayDateToString(dateFun: any, dias: any) {
    const dtaMom = moment(dateFun);
    const time = moment.duration('03:00:00');
    const mom = dtaMom.subtract(time).add('days', dias);
    // return mom.format('YYYY-MM-DDTHH:MM:SS');

    // console.log(mom.utc().toString());
    console.log(mom.toISOString().substring(0, 19));
    return mom.toISOString().substring(0, 19);
  }

  convertDate(inputFormat: any, dia: any): string {
    function pad(s: number) {
      return s < 10 ? '0' + s : s;
    }
    const d = new Date(inputFormat);
    return [
      d.getFullYear(),
      pad(d.getMonth() + 1),
      pad(d.getDate() + dia),
    ].join('-');
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  isUndefined(value: any): boolean {
    return typeof value === 'undefined';
  }

  findItemById(): void {
    const formItem = this.pdvForm.get('itemForm') as FormGroup;
    const formItemValues = formItem.getRawValue();
    if (
      formItemValues.item != null &&
      this.isUndefined(formItemValues.item) === false
    ) {
      this.toastr.warning('Item já selecionado, remova com f2', 'Atenção');
      this.itemAgrupamento?.nativeElement.focus();
    } else {
      this.selectItemByCodForm(formItem);
    }
  }

  selectItemByCodForm(formItem: FormGroup): void {
    if (
      formItem.controls['id'].value != null &&
      formItem.controls['id'].value > 0
    ) {
      this.selectItemByCod(formItem.controls['id'].value);
    } else {
      this.toastr.error('Digite um código maior do que 0', 'error');
    }
  }

  selectItemByCod(id: number): void {
    this.spinner.show('fullSpinner');
    this._itemService.findById(id).subscribe({
      next: (data) => {
        this.spinner.hide('fullSpinner');
        this.setaModelAndFormItem(data);
        this.toastr.success('Encontrado com sucesso', '');
        this.cdr.detectChanges();
      },
      error: () => {
        this.spinner.hide('fullSpinner');
        this.toastr.error('Não foi encontrado item com esse codigo');
        this.cdr.detectChanges();
      },
    });
  }

  getBestAgrupamento(ig: ItemUnidadeDTO[]): ItemUnidadeDTO | null {
    if (ig.length === 0) {
      return null;
    } else {
      if (ig.length === 1) {
        return ig[0];
      } else {
        const fltAg = ig.filter((i) => {
          return i.fator > 1;
        });

        if (fltAg.length === 0) {
          ig.sort((obj1, obj2) => {
            if (obj1.fator > obj2.fator) {
              return 1;
            }
            if (obj1.fator < obj2.fator) {
              return -1;
            }
            return 0;
          });
          return ig[0];
        } else if (fltAg.length === 1) {
          return fltAg[0];
        } else if (fltAg.length > 1) {
          fltAg.sort((obj1, obj2) => {
            if (obj1.fator > obj2.fator) {
              return 1;
            }
            if (obj1.fator < obj2.fator) {
              return -1;
            }
            return 0;
          });
          return fltAg[0];
        } else {
          return null;
        }
      }
    }
  }

  setaModelAndFormItem(data: ItemDTO): void {
    const formItem = this.pdvForm.get('itemForm') as FormGroup;
    formItem.patchValue({
      id: data.id,
      codigoBarras: data.codigoBarras,
      nome: data.nome,
      idAux: data.idAux,
      nomeTypeahead: data.nome,
      qtd: 0,
      vlr: 0,
      perc: 0,
      item: data,
      agrupamento: this.getBestAgrupamento(data.itemUnidadeDTOs),
    });
    this.setaValidatorsItem();
    this.getAllImagesforItem(data.id);
    this.getPrecoEstoqueItem(data.id);
    this.itemAgrupamento?.nativeElement.focus();
    this.cdr.markForCheck();
  }

  findClienteById(): void {
    const clienteId: number | null = this.pdvForm.controls.clienteId.value;
    if (!this.isUndefined(clienteId) && clienteId !== null && clienteId > 0) {
      this.selectClienteByCod(clienteId);
    } else {
      this.toastr.warning('Digite um código de cliente válido', 'Atenção');
    }
  }
  getPrecoEstoqueItem(itemId: number): void {
    const estoqueId: number | null =
      this.pdvForm.controls.estoqueAlmoxarifadoId.value;
    const formItem = this.pdvForm.get('itemForm') as FormGroup;
    const values = formItem.getRawValue();

    let fator = 1;

    if (
      values.agrupamento !== null &&
      values.agrupamento.fator !== null &&
      values.agrupamento.fator > 0
    ) {
      fator = values.agrupamento.fator;
    }

    this._itemService.getItemAlxPrecoEstoque(itemId, estoqueId!).subscribe({
      next: (data) => {
        formItem.patchValue({
          estoqueUn: data.qtdDisponivel,
          vlrUn: data.vlr,
          estoqueUnAp: data.qtdDisponivel / fator,
          vlrUnAp: this.roundVlrTotal(data.vlr * fator, 2),
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        formItem.patchValue({
          estoqueUn: 0,
          vlrUn: 0,
        });
        this.cdr.detectChanges();
      },
    });
  }
  selectClienteByCod(id: number): void {
    this._clienteService.findById(id).subscribe({
      next: (data) => {
        // console.log(data);
        this.pdvForm.patchValue({
          clienteId: data.id,
          clienteNome: data.nome,
          clienteDTO: data,
        });

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.toastr.error(
          'Não foi encontrado cliente com esse codigo',
          'error'
        );
        this.cdr.detectChanges();
      },
    });
  }
}
