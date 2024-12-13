import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  Renderer2,
  ChangeDetectorRef,
} from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  tap,
  switchMap,
} from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AppMovimentoModalConfirmComponent } from '../modals/app-mov-modal-confirm/app-mov-modal-confirm.component';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import {
  ItemEstoqueStatus,
  MovimentoItemDTO,
  MovimentoTipoDTO,
  MovimentoTransfDTO,
} from '@modules/shared/models/movimento';
import {
  EstoqueAlmoxarifadoDTO,
  ItemDTO,
  ItemResumoDTO,
  ItemUnidadeDTO,
} from '@modules/shared/models/item';
import { UserDTO } from '@modules/shared/models/usuario';
import {
  EstoqueAlmoxarifadoService,
  ItemService,
  MovimentoService,
  UsuarioService,
} from '@modules/shared/services';
import { ModalFindMovimentoComponent } from '../modals/modal-find-movimento/modal-find-movimento.component';

@Component({
  selector: 'app-movimento-transf',
  templateUrl: './movimento-transf.component.html',
  styleUrls: ['./movimento-transf.component.scss'],
})
export class MovimentoTransfComponent implements OnInit {
  ColumnMode = ColumnMode;
  @ViewChild('inputIdCodItem') inputIdCodItem!: ElementRef;
  movimentoTransf!: MovimentoTransfDTO;
  almoxarifados!: EstoqueAlmoxarifadoDTO[];
  statusForm!: number;
  itemProcura!: ItemDTO;
  movimentoItem!: MovimentoItemDTO;
  selectedItemMovimento!: MovimentoItemDTO;
  usuarios!: UserDTO[];
  codItemProcura!: number;
  itemResumoDTO!: ItemResumoDTO;
  itemEstoqueStatus!: ItemEstoqueStatus;
  errorForm: any = {};
  selectionTypeSingle = SelectionType.single;

  /* Searching variables */
  searchingItem!: boolean;
  searchFailedItem!: boolean;

  public loading = false;

  selected: any[] = [];

  constructor(
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private _modalService: NgbModal,
    private _movimentoSimplesService: MovimentoService,
    private _itemService: ItemService,
    private _estoqueAlmoxarifadoService: EstoqueAlmoxarifadoService,
    private _usuarioService: UsuarioService,
    private spinner: NgxSpinnerService,
    // tslint:disable-next-line: deprecation
    private renderer: Renderer2
  ) {}
  ngOnInit() {
    this.searchingItem = false;
    this.searchFailedItem = false;
    this.buscaAlmoxarifados();
    this.statusForm = 1;
    this.iniciaObjs();
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

  onCadastra(): void {
    if (
      this.movimentoTransf != null &&
      this.movimentoTransf.estoqueAlmoxarifadoOrigemDTO != null &&
      this.movimentoTransf.estoqueAlmoxarifadoOrigemDTO.id > 0 &&
      this.movimentoTransf.estoqueAlmoxarifadoDestinoDTO != null &&
      this.movimentoTransf.estoqueAlmoxarifadoDestinoDTO.id > 0 &&
      this.movimentoTransf.estoqueAlmoxarifadoOrigemDTO.id ===
        this.movimentoTransf.estoqueAlmoxarifadoDestinoDTO.id
    ) {
      const activeModal = this._modalService.open(
        AppMovimentoModalConfirmComponent
      );
      activeModal.componentInstance.modalHeader = 'Atenção';
      activeModal.componentInstance.modalContent =
        'O estoque de destino deve ser diferente do de origem';
      activeModal.componentInstance.modalType = 'error';
      activeModal.componentInstance.defaultLabel = 'Ok';
      activeModal.result.then(
        (result) => {
          console.log(result);
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      this.spinner.show();
      this._movimentoSimplesService
        .postMovimentoTransfer(this.movimentoTransf)
        .subscribe(
          (data) => {
            this.spinner.hide();
            this.iniciaObjs();
            this.cdr.detectChanges();
          },
          (err) => {
            this.spinner.hide();
            if (
              Object.prototype.hasOwnProperty.call(err, 'error') &&
              err.error != null
            ) {
              this.errorForm = err.error;
            }
            this.cdr.detectChanges();
          }
        );
    }
  }

  onAcertaAlx(): void {
    const activeModal = this._modalService.open(
      AppMovimentoModalConfirmComponent
    );
    activeModal.componentInstance.modalHeader = 'Confirme a solicitação';
    activeModal.componentInstance.modalContent = `Deseja realmente acertar os estoques?
        Se clicar em sim, as quantidades positivas do almoxarifado filial será lançadas no de vendas`;
    activeModal.componentInstance.modalType = 'confirm';
    activeModal.componentInstance.defaultLabel = 'Não';
    activeModal.result.then(
      (result) => {
        if (result === 'confirm') {
          this.spinner.show();
          this._movimentoSimplesService
            .acertaAlmoxarifados(2, 3) // lançado na mão por enquanto alx 2 filial alx 3 vendas
            .subscribe(
              (data) => {
                this.spinner.hide();
                if (
                  data != null &&
                  Object.prototype.hasOwnProperty.call(data, 'status') &&
                  data.status === true
                ) {
                  this.pop('success', 'Acerto realizado com sucesso', '');
                } else {
                  this.pop(
                    'error',
                    'ERRO',
                    'Erro ao realizar requisião, contate o administrador.'
                  );
                }
                this.cdr.detectChanges();
              },
              (error) => {
                this.spinner.hide();
                this.pop(
                  'error',
                  'ERRO',
                  'Erro ao realizar requisião, contate o administrador.'
                );
                this.cdr.detectChanges();
              }
            );
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  findMovimentoItens(): void {
    const activeModal = this._modalService.open(ModalFindMovimentoComponent, {
      backdrop: 'static',
      size: 'xl',
    });
    activeModal.result.then(
      (result) => {
        if (
          result != null &&
          !this.isUndefined(result) &&
          this.isArray(result)
        ) {
          this.movimentoTransf.movimentoItemDTOs = [];
          result.forEach((mi: MovimentoItemDTO) => {
            if ((mi.qtd > 0 && mi.indGeraEstoque === true) || (mi.valor > 0 && mi.indGeraPreco === true)) {
              mi.status = 'novo';
              mi.id = null;
              mi.movimentoDTO_id = null;
            
              mi.valorUnitario = mi.valor / (mi.qtd * mi.itemUnidadeDTO!.fator);
              this.movimentoTransf.movimentoItemDTOs.push(mi);
            }
          });
          this.movimentoTransf.movimentoItemDTOs = [
            ...this.movimentoTransf.movimentoItemDTOs,
          ];
          this.movimentoTransf.movimentoItemDTOs.sort((v1, v2) => {
            if (v1.ordemInclusaoTimestamp < v2.ordemInclusaoTimestamp) {
                return -1;
            }
            if (v1.ordemInclusaoTimestamp > v2.ordemInclusaoTimestamp) {
                return 1;
            }
            return 0;
        });
          this.cdr.markForCheck();
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }
  isArray(value: any): boolean {
    return Array.isArray(value);
  }
  isUndefined(value: any): boolean {
    return typeof value === 'undefined';
  }

  onChangeAlmoxarifadoDestino(event: any): void {
    if (event != null) {
      event.srcElement.blur();
      event.preventDefault();
    }

    if (
      this.movimentoTransf != null &&
      this.movimentoTransf.estoqueAlmoxarifadoOrigemDTO != null &&
      this.movimentoTransf.estoqueAlmoxarifadoOrigemDTO.id > 0 &&
      this.movimentoTransf.estoqueAlmoxarifadoDestinoDTO != null &&
      this.movimentoTransf.estoqueAlmoxarifadoDestinoDTO.id > 0 &&
      this.movimentoTransf.estoqueAlmoxarifadoOrigemDTO.id ===
        this.movimentoTransf.estoqueAlmoxarifadoDestinoDTO.id
    ) {
      const activeModal = this._modalService.open(
        AppMovimentoModalConfirmComponent
      );
      activeModal.componentInstance.modalHeader = 'Atenção';
      activeModal.componentInstance.modalContent =
        'O estoque de destino deve ser diferente do de origem';
      activeModal.componentInstance.modalType = 'alert';
      activeModal.componentInstance.defaultLabel = 'Ok';
      activeModal.result.then(
        (result) => {
          setTimeout(() => {
            this.movimentoTransf.estoqueAlmoxarifadoDestinoDTO =
              new EstoqueAlmoxarifadoDTO();
            this.cdr.detectChanges();
          }, 400);
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  isActiveAlx(): boolean {
    if (
      this.movimentoTransf == null ||
      this.movimentoTransf.estoqueAlmoxarifadoOrigemDTO == null ||
      this.movimentoTransf.estoqueAlmoxarifadoOrigemDTO.id == null
    ) {
      return false;
    } else {
      return true;
    }
  }

  serverIsError(): boolean {
    return this.errorForm != null && this.errorForm.message != null
      ? true
      : false;
  }
  selectedItem(event: any) {
    this._itemService.findById(event.item.id).subscribe((resp: any) => {
      this.itemProcura = resp;
      this.selectedItemId(null, this.itemProcura.id);
      this.cdr.detectChanges();
    });
  }

  selectedItemId(event: any, idItem: number): void {
    this._itemService.findById(idItem).subscribe(
      (resp: any) => {
        this.itemProcura = resp;
        this.codItemProcura = this.itemProcura.id;
        this.movimentoItem.itemDTO = resp;
        let alx: EstoqueAlmoxarifadoDTO | null;

        if (this.isActiveAlx()) {
          alx = this.movimentoTransf.estoqueAlmoxarifadoOrigemDTO;
        } else {
          alx = this.almoxarifados[0];
        }

        this.getItemSaldoEstoque(alx!, this.itemProcura.id);
        this.cdr.detectChanges();
      },
      (err) => {
        this.pop(
          'error',
          'ERRO',
          'Erro ao buscar o item, revise o codigo digitado.'
        );
      }
    );
  }

  getRowClass(row: any) {
    return {
      'datatable-row-class': 1 === 1,
    };
  }

  onLimpa(): void {
    this.limpa();
    this.cdr.detectChanges();
  }
  limpa() {
    this.iniciaObjs();
    this.statusForm = 1;
    delete this.errorForm;
    this.selected = [];
    this.onLimpaMovimentoItem();
  }

  unsetSelected(): void {
    if (this.selected != null) {
      this.selected.splice(0, this.selected.length);
    }
  }

  iniciaObjs(): void {
    this.movimentoTransf = new MovimentoTransfDTO();
    this.movimentoTransf.movimentoItemDTOs = [];
    // this.movimentoTransf.estoqueAlmoxarifadoOrigemDTO = new EstoqueAlmoxarifadoDTO();
    this.movimentoTransf.estoqueAlmoxarifadoOrigemDTO = null;
    // this.movimentoTransf.estoqueAlmoxarifadoDestinoDTO = new EstoqueAlmoxarifadoDTO();
    this.movimentoTransf.estoqueAlmoxarifadoDestinoDTO = null;
    this.movimentoItem = new MovimentoItemDTO();
    this.selectedItemMovimento = new MovimentoItemDTO();

    delete this.errorForm;
    this.itemEstoqueStatus = new ItemEstoqueStatus();
  }

  getVlrMedio(): number {
    if (
      this.movimentoItem != null &&
      this.movimentoItem.qtd != null &&
      this.movimentoItem.valor != null &&
      this.movimentoItem.itemUnidadeDTO != null
    ) {
      return (
        this.movimentoItem.valor /
        (this.movimentoItem.qtd * this.movimentoItem.itemUnidadeDTO.fator)
      );
    }
    return 0;
  }

  addMovimentoItem(): void {
    // console.log('movimento item');

    if (
      this.movimentoItem.itemDTO == null ||
      this.movimentoItem.itemDTO.id == null ||
      this.movimentoItem.itemUnidadeDTO == null ||
      this.movimentoItem.itemUnidadeDTO.id == null ||
      this.movimentoItem.qtd == null ||
      this.movimentoItem.qtd <= 0
    ) {
      const activeModal = this._modalService.open(
        AppMovimentoModalConfirmComponent
      );
      activeModal.componentInstance.modalHeader = 'Erro - Atenção';
      activeModal.componentInstance.modalContent = `Para adicionar um item, o agrupamento, o item
            e a quantidade precisam ser adicionadas, favor revisar os campos.`;
      activeModal.componentInstance.modalType = 'error';
      activeModal.componentInstance.defaultLabel = 'Ok';
      activeModal.result.then(
        (result) => {
          console.log(result);
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      const buscaMovItem = this.movimentoTransf.movimentoItemDTOs.filter(
        (mv) => {
          return (
            mv.itemDTO.id === this.movimentoItem.itemDTO.id &&
            mv.itemUnidadeDTO!.id === this.movimentoItem.itemUnidadeDTO!.id
          );
        }
      );
      if (buscaMovItem.length > 0) {
        const activeModal = this._modalService.open(
          AppMovimentoModalConfirmComponent
        );
        activeModal.componentInstance.modalHeader = 'Erro - Atenção';
        activeModal.componentInstance.modalContent = `O item com essa unidade já foi adicionado`;
        activeModal.componentInstance.modalType = 'error';
        activeModal.componentInstance.defaultLabel = 'Ok';
        activeModal.result.then(
          (result) => {
            console.log(result);
          },
          (error) => {
            console.log(error);
          }
        );
      } else if (
        this.movimentoItem.indGeraPreco != null &&
        this.movimentoItem.indGeraPreco === true &&
        (this.movimentoItem.valor == null || this.movimentoItem.valor === 0)
      ) {
        const activeModal = this._modalService.open(
          AppMovimentoModalConfirmComponent
        );
        activeModal.componentInstance.modalHeader = 'Erro - Atenção';
        activeModal.componentInstance.modalContent = `Para gerar preço de Custo o valor
            do item deve ser diferente de 0.`;
        activeModal.componentInstance.modalType = 'error';
        activeModal.componentInstance.defaultLabel = 'Ok';
        activeModal.result.then(
          (result) => {
            console.log(result);
          },
          (error) => {
            console.log(error);
          }
        );
      } else if (
        this.movimentoItem.indGeraValidade != null &&
        this.movimentoItem.indGeraValidade === true &&
        this.movimentoItem.dtaValidade == null
      ) {
        const activeModal = this._modalService.open(
          AppMovimentoModalConfirmComponent
        );
        activeModal.componentInstance.modalHeader = 'Erro - Atenção';
        activeModal.componentInstance.modalContent = `Para gerar data de validade é
            necessário adicionar a data de validade.`;
        activeModal.componentInstance.modalType = 'error';
        activeModal.componentInstance.defaultLabel = 'Ok';
        activeModal.result.then(
          (result) => {
            console.log(result);
          },
          (error) => {
            console.log(error);
          }
        );
      } else {
        if (this.movimentoItem.valor == null || this.movimentoItem.valor <= 0) {
          this.movimentoItem.valor = 0;
        }

        // console.log(this.movimentoItem);

        this.movimentoItem.status = 'novo';
        this.movimentoItem.ordemInclusaoTimestamp = new Date().getTime();

        this.movimentoTransf.movimentoItemDTOs.push(this.movimentoItem);

        this.movimentoTransf.movimentoItemDTOs =
          this.movimentoTransf.movimentoItemDTOs.sort((obj1, obj2) => {
            if (obj1.ordemInclusaoTimestamp > obj2.ordemInclusaoTimestamp) {
              return 1;
            }
            if (obj1.ordemInclusaoTimestamp < obj2.ordemInclusaoTimestamp) {
              return -1;
            }
            return 0;
          });

        this.movimentoTransf.movimentoItemDTOs = [
          ...this.movimentoTransf.movimentoItemDTOs,
        ];
        this.onLimpaMovimentoItem();
        this.inputIdCodItem.nativeElement.focus();
        this.cdr.detectChanges();
      }
    }
  }
  getItemSaldoEstoque(
    estoqueAlmoxarifadoDTO: EstoqueAlmoxarifadoDTO,
    idItem: number
  ): void {
    this.itemEstoqueStatus.flgBuscando = 1;
    this.itemEstoqueStatus.msg =
      'Buscando o Saldo para Item no Almoxarifado: ' +
      estoqueAlmoxarifadoDTO.nome;
    this._itemService
      .getItemSaldoEstoque(estoqueAlmoxarifadoDTO.id, idItem)
      .subscribe(
        (data) => {
          this.itemProcura.qtdEntrada = data.qtdEntrada;
          this.itemProcura.qtdSaida = data.qtdSaida;
          this.itemProcura.qtdSaldo = data.qtdSaldo;
          this.itemEstoqueStatus.flgBuscando = 0;
          this.itemEstoqueStatus.msg =
            'Unidade(s) - Estoque atual para o Almoxarifado: ' +
            estoqueAlmoxarifadoDTO.nome;
          this.cdr.detectChanges();
        },
        (err) => {
          this.itemProcura.qtdEntrada = 0;
          this.itemProcura.qtdSaida = 0;
          this.itemProcura.qtdSaldo = 0;
          this.itemEstoqueStatus.flgBuscando = 0;
          this.itemEstoqueStatus.msg =
            'Não existe lançamento para o item neste Almoxarifado';
          this.cdr.detectChanges();
        }
      );
  }

  onLimpaMovimentoItem(): void {
    this.movimentoItem = new MovimentoItemDTO();
    this.selectedItemMovimento = new MovimentoItemDTO();
    this.selected = [];
    this.itemEstoqueStatus = new ItemEstoqueStatus();
    this.cdr.detectChanges();
  }
  onDeletaMovimentoItem(): void {
    for (let i = 0; i < this.movimentoTransf.movimentoItemDTOs.length; i++) {
      if (
        this.movimentoTransf.movimentoItemDTOs[i].itemDTO.id ===
          this.selectedItemMovimento.itemDTO.id &&
        this.movimentoTransf.movimentoItemDTOs[i].itemUnidadeDTO!.id ===
          this.selectedItemMovimento.itemUnidadeDTO!.id
      ) {
        this.movimentoTransf.movimentoItemDTOs.splice(i, 1);
        i = this.movimentoTransf.movimentoItemDTOs.length + 1;
      }
    }
    this.movimentoTransf.movimentoItemDTOs = [
      ...this.movimentoTransf.movimentoItemDTOs,
    ];
    this.cdr.detectChanges();
  }

  compareUnidade(c1: ItemUnidadeDTO, c2: ItemUnidadeDTO): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
  buscaAlmoxarifados(): void {
    this._estoqueAlmoxarifadoService.getAllActive().subscribe(
      (resp) => {
        resp = resp.sort((obj1, obj2) => {
          if (obj1.nome > obj2.nome) {
            return 1;
          }
          if (obj1.nome < obj2.nome) {
            return -1;
          }
          return 0;
        });

        this.almoxarifados = resp;
        this.cdr.detectChanges();
      },
      (err) => {
        this.pop('error', 'Erro', 'Erro ao buscar os almoxarifados');
        this.cdr.detectChanges();
      }
    );
  }

  buscaUsuarios(): void {
    this._usuarioService.getUsers().subscribe(
      (resp) => {
        resp = resp.sort((obj1, obj2) => {
          if (obj1.login > obj2.login) {
            return 1;
          }
          if (obj1.login < obj2.login) {
            return -1;
          }
          return 0;
        });

        this.usuarios = resp;
        this.cdr.detectChanges();
      },
      (err) => {
        this.pop('error', 'Erro', 'Erro ao buscar os usuários');
        this.cdr.detectChanges();
      }
    );
  }

  atualizaUsuarios(): void {
    this.buscaUsuarios();
  }

  atualizaAlmoxarifados(): void {
    this.buscaAlmoxarifados();
  }

  compareMovimentoTipo(c1: MovimentoTipoDTO, c2: MovimentoTipoDTO): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  compareAlmoxarifado(
    c1: EstoqueAlmoxarifadoDTO,
    c2: EstoqueAlmoxarifadoDTO
  ): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  onSelectMovimentoItem({ selected }: any) {
    // console.log(selected);
    this.selectedItemMovimento = selected[0];
  }

  convertDate(inputFormat: any) {
    function pad(s: number) {
      return s < 10 ? '0' + s : s;
    }
    const d = new Date(inputFormat);
    return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
  }
}
