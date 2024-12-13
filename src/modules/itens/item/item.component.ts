import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { ImageBase64 } from '../itens.utils';
import { AppItensModalConfirmComponent } from '../modals/app-itens-modal-confirm/app-itens-modal-confirm.component';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'environments/environment';
import moment from 'moment';
import { ItemDTO, ItemDescontoQtdDTO, ItemFornecedorPadraoDTO, ItemGrupoDTO, ItemImagemDTO, ItemMarcaDTO, ItemNivelDTO, ItemPesquisaDTO, ItemPrecoDTO, ItemPredioDTO, ItemRuaDTO, ItemSeparadorDTO, ItemSubCategoriaDTO, ItemUnidadeDTO, PageItem } from '@modules/shared/models/item';
import { ItemMarcaService } from '@modules/shared/services/marca.service';
import { ItemSubCategoriaService } from '@modules/shared/services/subcategoria.service';
import { ItemGrupoService } from '@modules/shared/services/grupo.service';
import { ItemUnidadeService } from '@modules/shared/services/unidade.service';
import { ItemService } from '@modules/shared/services';
import { ItemFornecedorPadraoModalComponent } from '../modals/item-fornecedor/item-fornecedor.component';

@Component({
    selector: 'app-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss'],
})
export class ItemComponent implements OnInit {

    ColumnMode = ColumnMode;
    item!: ItemDTO;
    activeNav: any;
    pageItem!: PageItem;
    itemPesquisaDTO!: ItemPesquisaDTO;
    itens!: ItemDTO[];
    imageBase64!: ImageBase64;
    grupoSelected!: ItemGrupoDTO;
    marcas!: ItemMarcaDTO[];
    subCategorias!: ItemSubCategoriaDTO[];
    unidades!: ItemUnidadeDTO[];
    itemRuas!: ItemRuaDTO[];
    itemSeparadores: ItemSeparadorDTO[] = [];
    itemPredios: ItemPredioDTO[] = [];
    itemNiveis: ItemNivelDTO[] =[];
    unidadeSelected!: ItemUnidadeDTO | null;
    dataAtual!: Date;
    usuarioInclusao: string = environment.getUser().username;
    imagemInput: any;
    flgUploadImage: number;
    selectionTypeSingle = SelectionType.single;
    itemFornecedorPadraos: ItemFornecedorPadraoDTO[] = [];

    errorForm: any = {};
    authorities!: string[];
    grupoItemSelected: any = {};
    itemPrecoSelected: any = {};
    itemImageSelected: any = {};
    itemDescontoQtdSelected!: ItemDescontoQtdDTO;
    // status 1 = salvando, status 2 = editando, status 3 = pesquisando
    statusForm: number;

    public loading = false;

    // datatable
    selected: any[] = [];
    // datatable

    constructor(
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private _modalService: NgbModal,
        private _itemMarcaService: ItemMarcaService,
        private _itemSubCategoriaService: ItemSubCategoriaService,
        private _itemGrupoService: ItemGrupoService,
        private _itemUnidadeService: ItemUnidadeService,
        private _itemService: ItemService,
        private spinner: NgxSpinnerService,
    ) {
        this.statusForm = 1;
        this.flgUploadImage = 0;
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

    searchingGrupo = false;
    searchFailedGrupo = false;
    hideSearchingWhenUnsubscribedGrupo = new Observable(() => () => this.searchingGrupo = false);

    formatterGrupo = (x: { nome: string }) => x.nome;

    searchGrupo = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.searchingGrupo = true),
            switchMap(term =>
                this._itemGrupoService.findByName(term)
                    .pipe(
                        tap(() => this.searchFailedGrupo = false),
                        catchError(() => {
                            this.searchFailedGrupo = true;
                            return of([]);
                        })),
            ), tap(() => this.searchingGrupo = false))

    verificaGrupo(): void {
        if (this.grupoItemSelected == null || !Object.prototype.hasOwnProperty.call(this.grupoItemSelected,'id')) {
            this.grupoItemSelected = null;
            // console.log('nao existe supervisor');
        }
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
    }
    
    isUndefined(value: any): boolean {
        return typeof(value) === 'undefined';
    }

    grupoSelecionado(event: any, vGrupoSelecionado: any): void {
        this.grupoItemSelected = event.item;
        setTimeout(function () {
            vGrupoSelecionado.value = '';
        }, 400);

        this.addGrupo();
    }

    addGrupo(): void {
        if (this.grupoItemSelected == null || typeof (this.grupoItemSelected.id) === 'undefined') {
            this.pop('error', 'Erro', 'Selecione um grupo primeiro');
        } else {
            const filtros = this.item.itemGrupoDTOs.filter(g => {
                return g.id === this.grupoItemSelected.id;
            });

            if (filtros.length > 0) {
                this.pop('error', 'Erro', 'Grupo já foi adicionado!');
            } else {
                this.item.itemGrupoDTOs.push(this.grupoItemSelected);
            }
        }
    }

    voltar(): void {
        if (this.item.id > 0) {
            this.statusForm = 2;
        } else {
            this.statusForm = 1;
        }
    }

    excluiImg(id: number): void {
        const filtro = this.item.itemImagemDTOs.filter(image => {
            return image.id === id;
        });

        const activeModal = this._modalService.open(AppItensModalConfirmComponent);
        activeModal.componentInstance.modalHeader = 'Confirme a exclusão da Imagem';
        activeModal.componentInstance.modalContent = 'Deseja realmente excluir ?';
        activeModal.componentInstance.modalType = 'remove-image';
        activeModal.componentInstance.img = filtro[0];
        activeModal.componentInstance.defaultLabel = 'Não';
        activeModal.result.then((result) => {
            if (result === 'confirm') {
                this._itemService.delImagem(filtro[0].id)
                    .subscribe((data) => {
                        const filtro2 = this.item.itemImagemDTOs.filter(image => {
                            return image.id !== id;
                        });
                        this.item.itemImagemDTOs = [...filtro2];
                        this.cdr.detectChanges();
                    }, (err) => {
                        this.pop('error', 'Erro', 'Erro ao excluir imagem');
                    });
            }
        }, (error) => { console.log(error) });
    }

    iniciaItem(): void {
        this.item = new ItemDTO();
        this.item.itemDescontoQtdDTOs = [];
        this.item.itemGrupoDTOs = [];
        this.item.itemImagemDTOs = [];
        this.item.itemPrecoDTOs = [];
        this.item.itemUnidadeDTOs = [];
        this.item.itemMarcaDTO = null;
        this.item.itemSubCategoriaDTO = null;
        this.item.itemFornecedorPadraoDTO = null;
        this.item.itemRuaDTO = null;
        this.item.monitoraEstoqueAceitavelUN = false;
        this.item.minEstoqueAceitavelUN = 0;
        this.item.itemSeparadorDTO = null;
    }

    iniciaObjs(): void {
        this.iniciaItem();
        // this.item.itemSubCategoriaDTO = new ItemSubCategoriaDTO();
        // this.item.itemMarcaDTO = new ItemMarcaDTO();

        this.marcas = [];
        this.subCategorias = [];
        this.unidades = [];
        this.dataAtual = new Date();
        this.dataAtual.setHours(0, 0, 0, 0);
        this.itemDescontoQtdSelected = new ItemDescontoQtdDTO();
        this.itemDescontoQtdSelected.itemUnidadeDTO = null;
        this.itemPrecoSelected = new ItemPrecoDTO();
        this.itemImageSelected = new ItemImagemDTO();
        this.unidadeSelected = null;

        this.pageItem = new PageItem();
        this.itemPesquisaDTO = new ItemPesquisaDTO();
    }

    ngOnInit(): void {
        this.buscaMarcas();
        this.buscaSubCategorias();
        this.buscaUnidades();
        this.buscaRuas();
        this.buscaSeparadores();
        this.buscaNiveis();
        this.buscaPredios();
        this.buscaFornecedorPadrao();

        this.iniciaObjs();
        this.cdr.detectChanges();
    }

    addFornecedorPadrao(): void {
        const activeModal = this._modalService.open(ItemFornecedorPadraoModalComponent, 
            { size: 'lg'}
        );
        activeModal.result.then(() => {
            this.buscaFornecedorPadrao();
        }, (error) => { 
            console.log(error);
            this.buscaFornecedorPadrao();
        });
    }

    onPesquisa(): void {
        this.itemPesquisaDTO.itemDTO = this.item;
        this.pesquisaItem(this.itemPesquisaDTO);
    }

    pesquisaItem(itemPesquisa: ItemPesquisaDTO): void {

        this.selected = [];
        this.spinner.show();
        this._itemService.find(this.itemPesquisaDTO)
        .subscribe({
            next: (data) => {
                console.log(data);
                this.pageItem = data;
                this.spinner.hide();

                if (this.pageItem.content.length === 0) {
                    this.pop('error', 'Erro', 'Não foi encontrado nada com essa pesquisa');
                } else if (this.pageItem.content.length === 1) {
                    this.pop('success', 'Pesquisa', 'Encontrado apenas 1.');
                    this.setaItemDTO(this.pageItem.content[0]);
                    this.statusForm = 2;
                } else {
                    this.statusForm = 3;
                }
                this.cdr.detectChanges();
            },
            error: () => {
                this.spinner.hide();
            }
        });
    }

    setPage(pageInfo: any) {
        // console.log(pageInfo);
        this.itemPesquisaDTO.pageSize = pageInfo.pageSize;
        this.itemPesquisaDTO.pageNumber = pageInfo.offset;
        this.pesquisaItem(this.itemPesquisaDTO);
        this.cdr.detectChanges();
    }

    onDeleta(id: number): void {
        const activeModal = this._modalService.open(AppItensModalConfirmComponent);
        activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
        activeModal.componentInstance.modalContent = 'Deseja realmente excluir ?';
        activeModal.componentInstance.modalType = 'confirm';
        activeModal.componentInstance.defaultLabel = 'Não';
        activeModal.result.then((result) => {
            if (result === 'confirm') {
                this.loading = true;
                let message = '';
                this.spinner.show();
                this._itemService.del(id)
                .subscribe({
                    next: (resp: any) => {
                        this.spinner.hide();
                        this.loading = false;
                        message = resp.message;
                        this.itens = [];
                        this.pop('success', 'Sucesso', message);
                        this.onLimpa();
                        this.cdr.detectChanges();
                    },
                    error: (err) => {
                        this.spinner.hide();
                        this.loading = false;
                        message = err.message;
                        this.pop('error', 'Erro', message);
                        this.cdr.detectChanges();
                    }
                });
            }
        }, (error) => { console.log(error) });
    }
    buscaMarcas(): void {
        this._itemMarcaService.getAllActive()
        .subscribe({
            next: (data) => {
                data = data.sort((obj1, obj2) => {
                    if (obj1.nome > obj2.nome) {
                        return 1;
                    }
                    if (obj1.nome < obj2.nome) {
                        return -1;
                    }
                    return 0;
                });

                this.marcas = data;
                // console.log(this.clienteStatusLabels);
                this.cdr.detectChanges();
            },
            error: () => {
                this.pop('error', 'Erro', 'Erro ao buscar as marcas, contate o administrador');
            }
        });
    }

    buscaRuas(): void {
        this._itemService.getItemRuas()
        .subscribe({
            next: (data) => {
                data = data.sort((obj1, obj2) => {
                    if (obj1.nome > obj2.nome) {
                        return 1;
                    }
                    if (obj1.nome < obj2.nome) {
                        return -1;
                    }
                    return 0;
                });


                this.itemRuas = data;
                // console.log(this.clienteStatusLabels);
                this.cdr.detectChanges();
            },
            error: () => {
                this.pop('error', 'Erro', 'Erro ao buscar as ruas, contate o administrador');
            }
        });
    }

    buscaSeparadores(): void {
        this._itemService.getItemSeparadores()
        .subscribe({
            next: (data) => {
                this.itemSeparadores = data;
            },
            error: () => {
                this.toastr.error('Erro ao buscar os separadores, contate o administrador')
            }
        });
    }

    buscaPredios(): void {
        const predio = new ItemPredioDTO();
        this._itemService.findPredios(predio)
        .subscribe({
            next: (data) => {
                this.itemPredios = data;
            },
            error: () => {
                this.toastr.error('Erro ao buscar os prédios, contate o administrador')
            }
        });
    }

    buscaNiveis(): void {
        const nivel = new ItemNivelDTO();
        this._itemService.findNivels(nivel)
        .subscribe({
            next: (data) => {
                this.itemNiveis = data;
            },
            error: err => {
                this.toastr.error('Erro ao buscar os niveis, contate o administrador')
            }
        });
    }

    buscaSubCategorias(): void {
        this._itemSubCategoriaService.getAllActive()
        .subscribe({
            next: (data) => {
                data = data.sort((obj1, obj2) => {
                    if (obj1.nome > obj2.nome) {
                        return 1;
                    }
                    if (obj1.nome < obj2.nome) {
                        return -1;
                    }
                    return 0;
                });


                this.subCategorias = data;
                // console.log(this.clienteStatusLabels);
                this.cdr.detectChanges();
            },
            error: () => {
                this.pop('error', 'Erro', 'Erro ao buscar as sub categorias, contate o administrador');
            }
        });
    }

    buscaUnidades(): void {
        this._itemUnidadeService.getAll()
        .subscribe({
            next: (data) => {
                data = data.sort((obj1, obj2) => {
                    if (obj1.nome > obj2.nome) {
                        return 1;
                    }
                    if (obj1.nome < obj2.nome) {
                        return -1;
                    }
                    return 0;
                });


                this.unidades = data;
                // console.log(this.clienteStatusLabels);
                this.cdr.detectChanges();
            },
            error: () => {
                this.pop('error', 'Erro', 'Erro ao buscar as unidades, contate o administrador');
            }
        });
    }

    atualizaRuas(): void {
        this.buscaRuas();
    }

    atualizaSeparadores(): void {
        this.buscaSeparadores();
    }

    atualizaPredios(): void {
        this.buscaPredios();
    }

    atualizaNiveis(): void {
        this.buscaNiveis();
    }

    atualizaMarca(): void {
        this.buscaMarcas();
    }

    atualizaSubCategoria(): void {
        this.buscaSubCategorias();
    }

    atualizaUnidade(): void {
        this.buscaUnidades();
    }

    alterandoPreco(): void {
        this.pop('warning', 'Atenção', 'Você está alterando o preço do item, para efetivar clique em salvar');
    }

    removeRua(): void {
        this.item.itemRuaDTO = null;
    }

    removeSeparador(): void {
        this.item.itemSeparadorDTO = null;
    }

    removePredio(): void {
        this.item.itemPredioDTO = null;
    }

    removeNivel(): void {
        this.item.itemNivelDTO = null;
    }

    removeMarca(): void {
        this.item.itemMarcaDTO = null;
    }

    removeFornecedorPadrao(): void {
        this.item.itemFornecedorPadraoDTO = null;
    }
    removeSubCategoria(): void {
        this.item.itemSubCategoriaDTO = null;
    }
    removeUnidade(id: number): void {
        for (let i = 0; i < this.item.itemUnidadeDTOs.length; i++) {
            if (this.item.itemUnidadeDTOs[i].id === id) {
                this.item.itemUnidadeDTOs.splice(i, 1);
                i = this.item.itemUnidadeDTOs.length + 1;
                this.pop('success', 'OK', 'Unidade removida! Clique em salvar para efetivar');
            }
        }
    }

    compareRuas(r1: ItemRuaDTO, r2: ItemRuaDTO): boolean {
        return r1 && r2 ? r1.id === r2.id : r1 === r2;
    }

    compareMarca(c1: ItemMarcaDTO, c2: ItemMarcaDTO): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }

    compareUnidade(u1: ItemUnidadeDTO, u2: ItemUnidadeDTO): boolean {
        return u1 && u2 ? u1.id === u2.id : u1 === u2;
    }

    compareSubCategoria(c1: ItemSubCategoriaDTO, c2: ItemSubCategoriaDTO): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }

    onLimpa(): void {
        this.limpa();
        this.cdr.detectChanges();
        this.pop('info', 'Limpo com sucesso','');
    }

    getImageItem(): string {
        if (this.imageBase64 == null || typeof (this.imageBase64) === 'undefined') {
            return '';
        } else {
            return 'data:' + this.imageBase64.filetype + ';base64,' + this.imageBase64.value;
        }
    }

    isImageSelected(): boolean {
        return this.imageBase64 == null || typeof (this.imageBase64) === 'undefined' ? false : true;
    }

    onFileChange(event: any): void {
        // console.log(event);

        const reader = new FileReader();
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            if (file.size > 358400) {
                this.imagemInput = null;
                this.pop('error', 'Erro', 'Permitido imagens somente até 350Kb, escolha outra ou reduza o tamanho.');
            } else {
                this.flgUploadImage = 1;
                reader.readAsDataURL(file);
                reader.onload = () => {

                    if (file.type === 'image/jpeg' || file.type === 'image/gif' || file.type === 'image/png') {

                        const itImg = new ItemImagemDTO();

                        itImg.fileName = file.name;
                        itImg.fileType = file.type;
                        itImg.imgBase64 = reader.result!.toString().split(',')[1];
                        itImg.itemDTO_id = this.item.id;
                        itImg.extencao = itImg.fileName.substring(itImg.fileName.indexOf('.') + 1, itImg.fileName.length);

                        this._itemService.postImagem(itImg)
                            .subscribe((data) => {
                                this.pop('success', 'OK', 'Imagem publicada com sucesso');
                                this._itemService.getImagens(this.item.id)
                                    .subscribe((itemImageData) => {
                                        this.flgUploadImage = 0;

                                        itemImageData.forEach(el => {
                                            el.srcImg = ('data:' + el.fileType + ';base64,' + el.imgBase64);
                                            el.imgBase64 = null;
                                        });

                                        this.item.itemImagemDTOs = [...itemImageData];
                                        this.imagemInput = null;
                                        this.cdr.detectChanges();
                                    }, (err) => {
                                        this.pop('error', 'Erro', 'Erro ao buscar imagem');
                                        this.imagemInput = null;
                                        this.flgUploadImage = 0;
                                        this.cdr.detectChanges();
                                    });
                            }, (err) => {
                                this.pop('error', 'Erro', 'Erro ao publicar imagem');
                                this.imagemInput = null;
                                this.cdr.detectChanges();
                            });
                    } else {
                        this.imagemInput = null;
                        this.pop('error', 'Erro', 'Somente imagens são suportadas aqui, escolha jpg, png ou gif');
                        this.cdr.detectChanges();
                    }
                };
            }
        }
    }

    onCadastra(): void {
        console.log(this.item);
        this.loading = true;
        this.spinner.show();
        this._itemService.postOrPut(this.item, this.statusForm)
        .subscribe({
            next: (data) => {
                this.loading = false;
                this.spinner.hide();
                this.setaItemDTO(data);
                this.errorForm = {};
                this.statusForm = 2;
                this.itens = [];
                this.cdr.detectChanges();
            },
            error: err => {
                this.spinner.hide();
                this.loading = false;
                if (Object.prototype.hasOwnProperty.call(err, 'error') && err.error != null) {
                    this.errorForm = err.error;
                }
                this.cdr.detectChanges();
            }
        });
    }
    editando(): void {
        // console.log('selecionando para editar');
        const sel = this.pageItem.content.filter(us => {
            return us.id === this.selected[0].id;
        });
        // console.log(sel);
        this.setaItemDTO(sel[0]);
        this.statusForm = 2;
    }

    setaItemDTO(itemDTO: ItemDTO): void {
        this.item = itemDTO;
        this.item.itemDescontoQtdDTOs = [...this.item.itemDescontoQtdDTOs];
        this.item.itemGrupoDTOs = [...this.item.itemGrupoDTOs];

        if (this.item.itemImagemDTOs != null && this.item.itemImagemDTOs.length > 0) {
            this.item.itemImagemDTOs = [...this.item.itemImagemDTOs];
        }
        this.item.itemPrecoDTOs = [...this.item.itemPrecoDTOs];
        this.selecionaPrecoAtual();

        this._itemService.getImagens(this.item.id)
            .subscribe((itemImageData) => {
                this.flgUploadImage = 0;

                itemImageData.forEach(el => {
                    el.srcImg = ('data:' + el.fileType + ';base64,' + el.imgBase64);
                    el.imgBase64 = null;
                });

                this.item.itemImagemDTOs = [...itemImageData];
                this.imagemInput = null;
                this.cdr.detectChanges();
            }, (err) => {
                this.pop('error', 'Erro', 'Erro ao buscar imagem');
                this.imagemInput = null;
                this.flgUploadImage = 0;
                this.cdr.detectChanges();
            });
    }

    selecionaPrecoAtual(): void {
        const selPreco = this.item.itemPrecoDTOs.filter((p) => {
            return p.flAtual === true;
        });

        if (selPreco.length === 1) {
            this.item.precoAtual = selPreco[0];
        } else if (selPreco.length > 1) {
            this.item.precoAtual = selPreco[0];
        } else {
            this.item.precoAtual = new ItemPrecoDTO();
            this.item.precoAtual.preco = 0;
            this.item.precoAtual.dtaInclusao = new Date(0);
            this.item.precoAtual.usuarioInclusao = 'indefinido';
        }
    }

    getPrecoAtual(): number {
        if (this.item != null && this.item.precoAtual != null &&
            this.item.precoAtual.preco != null && this.item.precoAtual.preco > -1) {
            if (this.itemDescontoQtdSelected != null && this.itemDescontoQtdSelected.itemUnidadeDTO != null &&
                this.itemDescontoQtdSelected.itemUnidadeDTO.fator > 0) {
                return this.item.precoAtual.preco * this.itemDescontoQtdSelected.itemUnidadeDTO.fator;
            } else {
                return this.item.precoAtual.preco;
            }
        } else {
            return 0;
        }
    }

    getPercentualDesconto(): number {
        if (this.itemDescontoQtdSelected != null && this.itemDescontoQtdSelected.precoProposto > 0 &&
            this.getPrecoAtual() > 0) {
            return (((this.getPrecoAtual() - this.itemDescontoQtdSelected.precoProposto) / this.getPrecoAtual()) * 100);
        } else {
            return 0;
        }
    }

    isValidDelete(): boolean {
        return this.statusForm === 2 && this.item.id != null ? false : true;
    }

    setaColumns(itens: ItemDTO[]): void {
        if (itens.length === 1) {
            this.item = itens[0];
            this.statusForm = 2;
            this.pop('success', 'Encontrado apenas 1 registro', '');
        }
    }

    removeGrupo(id: number): void {
        for (let i = 0; i < this.item.itemGrupoDTOs.length; i++) {
            if (this.item.itemGrupoDTOs[i].id === id) {
                this.item.itemGrupoDTOs.splice(i, 1);
                i = this.item.itemGrupoDTOs.length + 1;
            }
        }
        this.pop('success', 'OK', 'Grupo removido! Clique em salvar para efetivar');
    }

    limpa(): void {
        this.iniciaObjs();
        this.statusForm = 1;
        this.errorForm = {};
        this.selected = [];
        this.buscaMarcas();
        this.buscaSubCategorias();
        this.buscaUnidades();
        this.buscaFornecedorPadrao();
        this.flgUploadImage = 0;
    }

    buscaFornecedorPadrao(): void {
        this._itemService.getAllItemFornecedorActivePadrao()
        .subscribe({
            next: (data) => {
                this.itemFornecedorPadraos = data;
                this.cdr.detectChanges();
            },
            error: () => {
                this.toastr.error('Erro ao buscar fornecedores', 'Erro');
            }
        });
    }

    isFornecedorPadrao(): boolean {
        return this.item.itemFornecedorPadraoDTO != null
            && Object.prototype.hasOwnProperty.call(this.item.itemFornecedorPadraoDTO,'id') ? true : false;
    }

    isMarca(): boolean {
        return this.item.itemMarcaDTO != null
            && Object.prototype.hasOwnProperty.call(this.item.itemMarcaDTO,'id') ? true : false;
    }

    isRua(): boolean {
        return this.item.itemRuaDTO != null
            && Object.prototype.hasOwnProperty.call(this.item.itemRuaDTO,'id') ? true : false;
    }

    isSeparador(): boolean {
        return this.item.itemSeparadorDTO != null
            && Object.prototype.hasOwnProperty.call(this.item.itemSeparadorDTO,'id') ? true : false;
    }

    isPredio(): boolean {
        return this.item.itemPredioDTO != null
            && Object.prototype.hasOwnProperty.call(this.item.itemPredioDTO,'id') ? true : false;
    }

    isNivel(): boolean {
        return this.item.itemNivelDTO != null
            && Object.prototype.hasOwnProperty.call(this.item.itemNivelDTO,'id') ? true : false;
    }

    isSubCategoria(): boolean {
        return this.item.itemSubCategoriaDTO != null
            && Object.prototype.hasOwnProperty.call(this.item.itemSubCategoriaDTO,'id') ? true : false;
    }

    addUnidade(): void {
        // console.log(this.grupoClienteSelected);
        if (this.unidadeSelected == null || typeof (this.unidadeSelected.id) === 'undefined') {
            this.pop('error', 'Erro', 'Selecione uma unidade primeiro');
        } else {
            const filtros = this.item.itemUnidadeDTOs.filter(g => {
                return g.id === this.unidadeSelected!.id;
            });

            if (filtros.length > 0) {
                this.pop('error', 'Erro', 'Unidade já foi adicionada');
            } else {
                this.item.itemUnidadeDTOs.push(this.unidadeSelected);
            }
        }
    }

    addPreco(): void {
        if (this.itemPrecoSelected.preco === 0) {
            this.pop('error', 'Erro', 'O preço deve ser diferente de 0');
        } else if (this.itemPrecoSelected.dtaIniValidade == null) {
            this.pop('error', 'Erro', `É preciso ter uma data de inicio da validade para o preço`);
        } else {
            if (moment(this.itemPrecoSelected.dtaIniValidade).isBefore(this.dataAtual)) {
                this.pop('error', 'Erro',
                    `A data que está tentando salvar para inicio é menor que a data do seu sistema,
                isso poderá dar problema ou não funcionar corretamente`);
            }
            this.itemPrecoSelected.dtaInclusao = new Date();
            this.itemPrecoSelected.usuarioInclusao = this.usuarioInclusao;
            this.itemPrecoSelected.status = 'novo';
            this.itemPrecoSelected.id = null;
            this.itemPrecoSelected.itemDTO_id = this.item.id;
            this.item.itemPrecoDTOs.push(this.itemPrecoSelected);
            this.item.itemPrecoDTOs = [...this.item.itemPrecoDTOs];
            this.onLimpaPreco();
        }
    }

    onLimpaPreco(): void {
        delete this.itemPrecoSelected;
        this.itemPrecoSelected = new ItemPrecoDTO();
        this.selected = [];
    }
    onDeletaPreco(): void {
        let flgRemovido = 0;
        for (let i = 0; i < this.item.itemPrecoDTOs.length; i++) {
            if (this.item.itemPrecoDTOs[i].preco === this.itemPrecoSelected.preco &&
                moment(this.item.itemPrecoDTOs[i].dtaInclusao).isSame(this.itemPrecoSelected.dtaInclusao)
            ) {
                flgRemovido = 1;
                this.item.itemPrecoDTOs.splice(i, 1);
                this.item.itemPrecoDTOs = [...this.item.itemPrecoDTOs];
                this.onLimpaPreco();
                this.pop('success', 'OK', 'Removido com sucesso! Clique em salvar para efetivar');
            }
        }
        if (flgRemovido === 0) {
            this.pop('error', 'Erro', 'Nenhum item foi removido, selecione na tabela');
        }
    }
    /*
        onDeletaPreco(): void {
            if (this.itemPrecoSelected == null ||
                this.itemPrecoSelected.status !== 'novo' &&
                this.itemPrecoSelected.dtaInclusao != null) {
                this.showToast(this.types[4], 'Erro', 'O preço que selecionou não pode ser excluido.');
            } else {
                for (let i = 0; i < this.item.itemPrecoDTOs.length; i++) {
                    if (this.item.itemPrecoDTOs[i].status === 'novo' &&
                        this.item.itemPrecoDTOs[i].preco === this.itemPrecoSelected.preco &&
                        moment(this.item.itemPrecoDTOs[i].dtaInclusao).isSame(this.itemPrecoSelected.dtaInclusao)
                    ) {
                        this.item.itemPrecoDTOs.splice(i, 1);
                        this.item.itemPrecoDTOs = [...this.item.itemPrecoDTOs];
                        this.onLimpaPreco();
                        this.showToast(this.types[1], 'OK', 'Removido com sucesso! Clique em salvar para efetivar');
                    }
                }
            }
        }
    */
    onDeletaDesconto(): void {
        let flgRemovido = 0;
        for (let i = 0; i < this.item.itemDescontoQtdDTOs.length; i++) {
            if (
                this.item.itemDescontoQtdDTOs[i].qtd === this.itemDescontoQtdSelected.qtd &&
                moment(this.item.itemDescontoQtdDTOs[i].dtaInclusao)
                    .isSame(this.itemDescontoQtdSelected.dtaInclusao)
            ) {
                flgRemovido = 1;
                this.item.itemDescontoQtdDTOs.splice(i, 1);
                this.item.itemDescontoQtdDTOs = [...this.item.itemDescontoQtdDTOs];
                this.onLimpaDesconto();
                this.pop('success', 'OK', 'Removido com sucesso! Clique em salvar para efetivar');
            }
        }
        if (flgRemovido === 0) {
            this.pop('error', 'Erro', 'Nenhum item foi removido, selecione na tabela');
        }
    }
    onLimpaDesconto(): void {
        this.selected = [];
        this.itemDescontoQtdSelected = new ItemDescontoQtdDTO();
    }

    onLeftArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.pageItem.content.length; i++) {
                if (this.item.id === this.pageItem.content[i].id) {
                    if ((i - 1) >= 0) {
                        this.selected = [];
                        this.setaItemDTO(this.pageItem.content[i - 1]);
                        i = this.pageItem.content.length + 1;
                        this.selected.push(this.item);
                    }
                }
            }
        }
    }

    onRightArray(): void {
        if (this.statusForm === 2) {
            for (let i = 0; i < this.pageItem.content.length; i++) {
                if (this.item.id === this.pageItem.content[i].id) {
                    this.selected = [];
                    if ((i + 1) < this.pageItem.content.length) {
                        this.setaItemDTO(this.pageItem.content[i + 1]);
                        i = this.pageItem.content.length + 1;
                        this.selected.push(this.item);
                    }
                }
            }
        }
    }

    onTable(): void {
        if (this.pageItem.content != null && this.pageItem.content.length > 0) {
            this.statusForm = 3;
        } else {
            this.pop('error', 'Erro', 'Procure primeiro');
        }
    }
    addDesconto(): void {
        if (
            this.itemDescontoQtdSelected.itemUnidadeDTO == null ||
            this.itemDescontoQtdSelected.percDesc == null ||
            this.itemDescontoQtdSelected.qtd == null ||
            this.itemDescontoQtdSelected.dtaIniValidade == null ||

            this.itemDescontoQtdSelected.qtd === 0 ||
            this.itemDescontoQtdSelected.percDesc === 0
        ) {
            this.pop('error', 'Erro', `Para adicionar o desconto os itens de campo precisam ser selecionados
            O Agrupamento, o percentual de desconto, a quantidade e a data de
            inicio de validade, a quantidade tambem precisa ser maior que 0.`);
        } else if (this.itemDescontoQtdSelected.percDesc >= 100) {
            this.pop('error', 'Erro', `O percentual de desconto não pode ser maior que 100%`);
        } else {
            if (moment(this.itemDescontoQtdSelected.dtaIniValidade).isBefore(this.dataAtual)) {
                this.pop('error', 'Erro', `A data que está tentando salvar para inicio é menor que a data do seu sistema,
            isso poderá dar problema ou não funcionar corretamente`);
            }

            this.itemDescontoQtdSelected.dtaInclusao = new Date();
            this.itemDescontoQtdSelected.usuarioInclusao = this.usuarioInclusao;
            this.itemDescontoQtdSelected.id = null;
            this.itemDescontoQtdSelected.itemDTO_id = this.item.id;

            this.item.itemDescontoQtdDTOs.push(this.itemDescontoQtdSelected);
            this.item.itemDescontoQtdDTOs = [...this.item.itemDescontoQtdDTOs];
            this.onLimpaDesconto();
        }
    }


    onSelectPreco({ selected }: any) {
        this.itemPrecoSelected = selected[0];
        // console.log(this.itemPrecoSelected);
    }
    onSelectDescontoQtd({ selected }: any) {
        this.itemDescontoQtdSelected = selected[0];
    }
    onSelectImage({ selected }: any) {
        this.itemImageSelected = selected[0];
    }

    onActivate(event: any) {
        if (
            (event.type === 'dblclick') ||
            (event.type === 'keydown' && event.event.keyCode === 13)
        ) {
            this.editando();
        }
    }
}
