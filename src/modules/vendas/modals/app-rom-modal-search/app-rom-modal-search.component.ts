import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EstoqueAlmoxarifadoDTO } from '@modules/print/print-utils';
import { FuncionarioDTO } from '@modules/shared/models/funcionario';
import { MunicipioDTO } from '@modules/shared/models/layout.utils';
import { PageVenda, VendaPesquisaDTO, VendaStatusLabelDTO } from '@modules/shared/models/venda';
import { EstoqueAlmoxarifadoService, FuncionarioService, LayoutService, VendaService } from '@modules/shared/services';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-rom-modal-search',
    templateUrl: './app-rom-modal-search.component.html',
    styleUrls: ['./app-rom-modal-search.component.scss'],
})
export class AppRomModalSearchComponent implements OnInit {
    submitted = false;
    selectionTypeSingle = SelectionType.single;
    ColumnMode = ColumnMode;
    selected: any[] = [];

    @Input() modalHeader = 'Header';
    @Input() modalContent = 'Content';
    municipios: MunicipioDTO[] = [];
    vendaStatusLabels: VendaStatusLabelDTO[] = [];
    estoqueAlmoxarifados: EstoqueAlmoxarifadoDTO[] = [];
    vendedores: FuncionarioDTO[] = [];
    pageVenda!: PageVenda;

    searchForm = new FormGroup({
        dtaEmissaoInicial: new FormControl<Date | null>(null),
        dtaEmissaoFinal: new FormControl<Date | null>(null),
        dtaEntregaInicial: new FormControl<Date | null>(null),
        dtaEntregaFinal: new FormControl<Date | null>(null),
        municipioDTOs: new FormControl<any | null>(null),
        vendaStatusLabelDTOs: new FormControl<any | null>(null),
        estoqueAlmoxarifadoDTO: new FormControl<any | null>(null),
        vendedor: new FormControl<any | null>(null),
    });

    constructor(
        public activeModal: NgbActiveModal,
        private _vendaService: VendaService,
        private cdr: ChangeDetectorRef,
        private _pagesService: LayoutService,
        private _estoqueAlmoxarifado: EstoqueAlmoxarifadoService,
        private _funcionarioService: FuncionarioService,
        private spinner: NgxSpinnerService,
        private toastr: ToastrService,
    ) { }

    ngOnInit(): void {
        this.buscaMunicipios();
        this.getAllStatusLabel();
        this.buscaEstoqueAlmoxarifado();
        this.buscaVendor();
    }

    get f() {
        return this.searchForm.controls;
    }

    getVendaPesquisaDTO(): VendaPesquisaDTO {
        const formValues = this.searchForm.getRawValue();
        this.submitted = true;

        const searchDTO = new VendaPesquisaDTO();
        searchDTO.dtaEmissaoInicial = formValues.dtaEmissaoInicial;
        searchDTO.dtaEmissaoFinal = formValues.dtaEmissaoFinal;
        searchDTO.dtaEntregaInicial = formValues.dtaEntregaInicial;
        searchDTO.dtaEntregaFinal = formValues.dtaEntregaFinal;
        searchDTO.municipioDTOs = formValues.municipioDTOs;
        searchDTO.vendaStatusLabelDTOs = formValues.vendaStatusLabelDTOs;
        searchDTO.estoqueAlmoxarifadoDTO = formValues.estoqueAlmoxarifadoDTO;
        searchDTO.vendedor = formValues.vendedor;
        searchDTO.pageSize = 20;
        console.log(searchDTO);
        return searchDTO;
    }

    onPesquisa(): void {
        const searchDTO = this.getVendaPesquisaDTO();
        this.pesquisaVenda(searchDTO);
    }

    selecionarTodasAsVendas() {
        this.pageVenda.content.forEach((item) => {
          item.imprime = true;
        });
      }

    onAdd(): void {
        if (this.pageVenda === null || this.pageVenda === undefined) {
            this.toastr.warning('Nenhuma venda selecionada.', 'Adicionar');
            return;
        }

        const flt = this.pageVenda.content.filter(ct => {
        if (!this.isUndefined(ct.imprime) && ct.imprime !== null && ct.imprime === true) {
            return true;
        } else {
            return false;
        }
        });
    
        if (flt.length === 0) {
            this.toastr.warning('Nenhuma venda selecionada.', 'Adicionar');
        } else {
            this.activeModal.close(flt);
        }
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
    }

    isUndefined(value: any): boolean {
        return typeof value === 'undefined';
    }

    setPage(pageInfo: any) {
        const searchDTO = this.getVendaPesquisaDTO();
        searchDTO.pageSize = pageInfo.pageSize;
        searchDTO.pageNumber = pageInfo.offset;
        this.pesquisaVenda(searchDTO);
    }

    pesquisaVenda(vendaPesquisa: VendaPesquisaDTO): void {
        this.spinner.show('spinnerSearch');
        this._vendaService.find2(vendaPesquisa).subscribe({
            next: (data) => {
                this.spinner.hide('spinnerSearch');
                this.pageVenda = data;

                console.log(this.pageVenda);

                if (this.pageVenda.content.length === 0) {
                    this.toastr.error('Não foi encontrado nada com essa pesquisa.', 'Pesquisa');
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error(err);
                this.toastr.error('Erro ao pesquisar.', 'Pesquisa');
                this.spinner.hide('spinnerSearch');
            },
        });
    }

    onLimpa(): void {
        this.searchForm.reset();
        this.searchForm.patchValue({
            municipioDTOs: null,
            vendaStatusLabelDTOs: null,
            estoqueAlmoxarifadoDTO: null,
            vendedor: null,
            dtaEmissaoInicial: null,
            dtaEmissaoFinal: null,
            dtaEntregaInicial: null,
            dtaEntregaFinal: null,
        });
        this.submitted = false;

        this.pageVenda.content = [];
    }

    buscaVendor(): void {
        this._funcionarioService.getAllActiveVendedor().subscribe({
            next: (data) => {
                this.vendedores = data;
                this.cdr.detectChanges();
            }
        });
    }

    buscaEstoqueAlmoxarifado(): void {
        this._estoqueAlmoxarifado.getAllActive().subscribe({
            next: (data) => {
                this.estoqueAlmoxarifados = data;
                this.cdr.detectChanges();
            }
        });
    }

    buscaMunicipios(): void {
        this._pagesService.buscaMunicipios().subscribe({
            next: (data) => {
                this.municipios = data;
                this.cdr.detectChanges();
            }
        });
    }

    getAllStatusLabel(): void {
        this._vendaService.getVendaStatusLabels().subscribe({
            next: (data) => {
                this.vendaStatusLabels = data;
                this.cdr.detectChanges();
            }
        });
    }

    compareStatus(s1: VendaStatusLabelDTO, s2: VendaStatusLabelDTO): boolean {
        return s1 && s2 ? s1.sigla === s2.sigla : s1 === s2;
    }

    compareMunicipios(c1: MunicipioDTO,
        c2: MunicipioDTO
    ): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }

    compareVendedor(v1: FuncionarioDTO, v2: FuncionarioDTO): boolean {
        return v1 && v2 ? v1.id === v2.id : v1 === v2;
    }

    compareAlx(v1: EstoqueAlmoxarifadoDTO, v2: EstoqueAlmoxarifadoDTO): boolean {
        return v1 && v2 ? v1.id === v2.id : v1 === v2;
    }
}
