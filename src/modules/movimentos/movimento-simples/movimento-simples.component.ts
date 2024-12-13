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
import { CurrentUserLoged } from '@modules/shared/models/layout.utils';
import {
  ItemEstoqueStatus,
  MovimentoDTO,
  MovimentoItemDTO,
  MovimentoTipoDTO,
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
  MovimentoTipoService,
  UsuarioService,
} from '@modules/shared/services';
import { ModalFindMovimentoComponent } from '../modals/modal-find-movimento/modal-find-movimento.component';

@Component({
  selector: 'app-movimento-simples',
  templateUrl: './movimento-simples.component.html',
  styleUrls: ['./movimento-simples.component.scss'],
})
export class MovimentoSimplesComponent implements OnInit {
  @ViewChild('inputIdCodItem') inputIdCodItem: ElementRef | undefined;
  currentUserSalesApp!: CurrentUserLoged;
  ColumnMode = ColumnMode;
  movimento!: MovimentoDTO;
  movimentoTipos!: MovimentoTipoDTO[];
  almoxarifados!: EstoqueAlmoxarifadoDTO[];
  statusForm!: number;
  itemProcura!: ItemDTO | null | undefined;
  movimentoItem!: MovimentoItemDTO;
  selectedItemMovimento!: MovimentoItemDTO;
  usuarios!: UserDTO[];
  codItemProcura!: number | null;
  itemResumoDTO!: ItemResumoDTO;
  errorForm: any = {};
  itemEstoqueStatus!: ItemEstoqueStatus;
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
    private _movimentoTipoService: MovimentoTipoService,
    private _itemService: ItemService,
    private _estoqueAlmoxarifadoService: EstoqueAlmoxarifadoService,
    private _usuarioService: UsuarioService,
    private spinner: NgxSpinnerService,
    private renderer: Renderer2
  ) {}
  ngOnInit() {
    this.currentUserSalesApp = JSON.parse(
      sessionStorage.getItem('currentUserSalesApp')!
    );
    this.searchingItem = false;
    this.searchFailedItem = false;
    this.buscaMovimentoTipos();
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
    this.spinner.show();
    console.log(this.movimento);
    this._movimentoSimplesService
      .postMovimentoSimples(this.movimento)
      .subscribe({
        next: () => {
          this.spinner.hide();
          this.iniciaObjs();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.spinner.hide();
          if (
            Object.prototype.hasOwnProperty.call(err, 'error') &&
            err.error != null
          ) {
            this.errorForm = err.error;
          }
          this.cdr.detectChanges();
        },
      });
  }

  isActiveAlx(): boolean {
    if (
      this.movimento == null ||
      this.movimento.estoqueAlmoxarifadoDTO == null ||
      this.movimento.estoqueAlmoxarifadoDTO.id == null
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

  isUndefined(value: any): boolean {
    return typeof value === 'undefined';
  }

  mensagemAlerta(titulo: string, content: string, type: string): void {
    const activeModal = this._modalService.open(
      AppMovimentoModalConfirmComponent
    );
    activeModal.componentInstance.modalHeader = titulo;
    activeModal.componentInstance.modalContent = content;
    activeModal.componentInstance.modalType = 'alert';
    activeModal.componentInstance.defaultLabel = 'Ok';
    activeModal.result.then(
      (result) => {
        console.log(result);
      },
      (error) => {
        console.log(error);
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
  }
  limpa() {
    // console.log('limpando');
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
    this.movimento = new MovimentoDTO();
    this.movimento.movimentoTipoDTO = null;
    this.movimento.estoqueAlmoxarifadoDTO = null;
    this.movimento.usuarioInclusao = null;
    this.movimento.movimentoItemDTOs = [];

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

  alteraValoresItem(): void {
    this.inputVlrUnitarioToValor();
    this.cdr.detectChanges();
  }

  inputValorToVlrUnitario(): void {
    let qtd = 0;
    let fator = 1;
    if (this.isUndefined(this.movimentoItem.qtd) === false && this.movimentoItem.qtd != null && this.movimentoItem.qtd > 0) {
      qtd = this.movimentoItem.qtd;
    }

    if (this.isUndefined(this.movimentoItem.itemUnidadeDTO) === false && this.movimentoItem.itemUnidadeDTO != null && this.movimentoItem.itemUnidadeDTO.id > 0) {
      fator = this.movimentoItem.itemUnidadeDTO.fator;
    }

    this.movimentoItem.valorUnitario = this.movimentoItem.valor / (qtd * fator);
    this.cdr.detectChanges();
  }

  inputVlrUnitarioToValor(): void {
    let qtd =0;
    let fator = 1;
    if (this.isUndefined(this.movimentoItem.qtd) === false && this.movimentoItem.qtd != null && this.movimentoItem.qtd > 0) {
      qtd = this.movimentoItem.qtd;
    }

    if (this.isUndefined(this.movimentoItem.itemUnidadeDTO) === false && this.movimentoItem.itemUnidadeDTO != null && this.movimentoItem.itemUnidadeDTO.id > 0) {
      fator = this.movimentoItem.itemUnidadeDTO.fator;
    }

    this.movimentoItem.valor = this.movimentoItem.valorUnitario * (qtd * fator);
    this.cdr.detectChanges();
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
      this.mensagemAlerta(
        'Erro - Atenção',
        `Para adicionar um item, o agrupamento, o item
            e a quantidade precisam ser adicionadas, favor revisar os campos.`,
        'error'
      );
    } else {
      const buscaMovItem = this.movimento.movimentoItemDTOs.filter((mv) => {
        return (
          mv.itemDTO.id === this.movimentoItem.itemDTO.id &&
          mv.itemUnidadeDTO!.id === this.movimentoItem.itemUnidadeDTO!.id
        );
      });
      if (buscaMovItem.length > 0) {
        this.mensagemAlerta(
          'Erro - Atenção',
          `O item com essa unidade já foi adicionado`,
          'error'
        );
      } else if (
        this.movimentoItem.indGeraPreco != null &&
        this.movimentoItem.indGeraPreco === true &&
        (this.movimentoItem.valor == null || this.movimentoItem.valor === 0)
      ) {
        this.mensagemAlerta(
          'Erro - Atenção',
          `Para gerar preço de Custo o valor
                 do item deve ser diferente de 0.`,
          'error'
        );
      } else if (
        this.movimentoItem.indGeraValidade != null &&
        this.movimentoItem.indGeraValidade === true &&
        this.movimentoItem.dtaValidade == null
      ) {
        this.mensagemAlerta(
          'Erro - Atenção',
          `Para gerar data de validade é
                 necessário adicionar a data de validade.`,
          'error'
        );
      } else {
        if (this.movimentoItem.valor == null || this.movimentoItem.valor <= 0) {
          this.movimentoItem.valor = 0;
        }

        // console.log(this.movimentoItem);

        this.movimentoItem.status = 'novo';
        this.movimentoItem.ordemInclusaoTimestamp = new Date().getTime();

        this.movimento.movimentoItemDTOs.push(this.movimentoItem);

        this.movimento.movimentoItemDTOs =
          this.movimento.movimentoItemDTOs.sort((obj1, obj2) => {
            if (obj1.ordemInclusaoTimestamp > obj2.ordemInclusaoTimestamp) {
              return 1;
            }
            if (obj1.ordemInclusaoTimestamp < obj2.ordemInclusaoTimestamp) {
              return -1;
            }
            return 0;
          });

        this.movimento.movimentoItemDTOs = [
          ...this.movimento.movimentoItemDTOs,
        ];
        this.onLimpaMovimentoItem();
        this.inputIdCodItem!.nativeElement.focus();
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
      .subscribe({
        next: (data) => {
          this.itemProcura!.qtdEntrada = data.qtdEntrada;
          this.itemProcura!.qtdSaida = data.qtdSaida;
          this.itemProcura!.qtdSaldo = data.qtdSaldo;
          this.itemEstoqueStatus.flgBuscando = 0;
          this.itemEstoqueStatus.msg =
            'Unidade(s) - Estoque atual para o Almoxarifado: ' +
            estoqueAlmoxarifadoDTO.nome;
          this.cdr.detectChanges();
        },
        error: () => {
          this.itemProcura!.qtdEntrada = 0;
          this.itemProcura!.qtdSaida = 0;
          this.itemProcura!.qtdSaldo = 0;
          this.itemEstoqueStatus.flgBuscando = 0;
          this.itemEstoqueStatus.msg =
            'Não existe lançamento para o item neste Almoxarifado';
          this.cdr.detectChanges();
        },
      });
  }
  onLimpaMovimentoItem(): void {
    this.movimentoItem = new MovimentoItemDTO();
    this.selectedItemMovimento = new MovimentoItemDTO();
    this.selected = [];
    this.itemEstoqueStatus = new ItemEstoqueStatus();
    this.itemProcura = null;
    this.codItemProcura = null;
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
          this.movimento.movimentoItemDTOs = [];
          result.forEach((mi: MovimentoItemDTO) => {
            if ((mi.qtd > 0 && mi.indGeraEstoque === true) || (mi.valor > 0 && mi.indGeraPreco === true)) {
              mi.status = 'novo';
              mi.id = null;
              mi.movimentoDTO_id = null;
              mi.valorUnitario = mi.valor / (mi.qtd * mi.itemUnidadeDTO!.fator);
              this.movimento.movimentoItemDTOs.push(mi);
            }
          });
          this.movimento.movimentoItemDTOs = [
            ...this.movimento.movimentoItemDTOs,
          ];
          this.movimento.movimentoItemDTOs.sort((v1, v2) => {
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

  onDeletaMovimentoItem(): void {
    for (let i = 0; i < this.movimento.movimentoItemDTOs.length; i++) {
      if (
        this.movimento.movimentoItemDTOs[i].itemDTO.id ===
          this.selectedItemMovimento.itemDTO.id &&
        this.movimento.movimentoItemDTOs[i].itemUnidadeDTO!.id ===
          this.selectedItemMovimento.itemUnidadeDTO!.id
      ) {
        this.movimento.movimentoItemDTOs.splice(i, 1);
        i = this.movimento.movimentoItemDTOs.length + 1;
      }
    }
    this.movimento.movimentoItemDTOs = [...this.movimento.movimentoItemDTOs];
    this.cdr.detectChanges();
  }

  buscaMovimentoTipos(): void {
    this._movimentoTipoService.getAllActive().subscribe({
      next: (resp) => {
        resp = resp.sort((obj1, obj2) => {
          if (obj1.nome > obj2.nome) {
            return 1;
          }
          if (obj1.nome < obj2.nome) {
            return -1;
          }
          return 0;
        });

        this.movimentoTipos = resp;
        this.cdr.detectChanges();
      },
      error: () => {
        this.pop('error', 'Erro ao buscar tipos de movimento', '');
        this.cdr.detectChanges();
      },
    });
  }

  compareUnidade(c1: ItemUnidadeDTO, c2: ItemUnidadeDTO): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  selectedItem(event: any) {
    this._itemService.findById(event.item.id).subscribe({
      next: (resp: any) => {
        this.itemProcura = resp;
        this.selectedItemId(null, this.itemProcura!.id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.pop('error', 'Erro ao buscar o Item.', '');
        this.cdr.detectChanges();
      },
    });
  }

  selectedItemId(event: any, idItem: number): void {
    if (event != null) {
      event.srcElement.blur();
      event.preventDefault();
    }

    this._itemService.findById(idItem).subscribe({
      next: (resp: any) => {
        this.itemProcura = resp;
        this.codItemProcura = this.itemProcura!.id;
        this.movimentoItem.itemDTO = resp;
        let alx: EstoqueAlmoxarifadoDTO | null;

        if (this.isActiveAlx()) {
          alx = this.movimento.estoqueAlmoxarifadoDTO;
        } else {
          alx = this.almoxarifados[0];
        }

        this.getItemSaldoEstoque(alx!, this.itemProcura!.id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.onLimpaMovimentoItem();
        this.pop(
          'error',
          'Erro ao buscar o item, revise o codigo digitado.',
          ''
        );
        this.cdr.detectChanges();
      },
    });
  }

  buscaAlmoxarifados(): void {
    this._estoqueAlmoxarifadoService.getAllActive().subscribe({
      next: (data) => {
        let dtaf = data.filter((alx) => {
          return (
            alx.roleAcesso == null ||
            alx.roleAcesso.length === 0 ||
            this.currentUserSalesApp.user.authorityDTOs.filter((auth) => {
              return auth.name === alx.roleAcesso;
            }).length > 0
          );
        });

        dtaf = dtaf.sort((obj1, obj2) => {
          if (obj1.nome > obj2.nome) {
            return 1;
          }
          if (obj1.nome < obj2.nome) {
            return -1;
          }
          return 0;
        });

        this.almoxarifados = dtaf;
        this.cdr.detectChanges();
      },
      error: () => {
        this.pop('error', 'Erro', 'Erro ao buscar os almoxarifados');
        this.cdr.detectChanges();
      },
    });
  }

  buscaUsuarios(): void {
    this._usuarioService.getUsers().subscribe({
      next: (resp: UserDTO[]) => {
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
      error: () => {
        this.pop('error', 'Erro ao buscar os usuários', '');
        this.cdr.detectChanges();
      },
    });
  }

  atualizaUsuarios(): void {
    this.buscaUsuarios();
  }

  atualizaMovimentoTipo(): void {
    this.buscaMovimentoTipos();
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
