import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  tap,
  switchMap,
} from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppFuncModalConfirmComponent } from '../modals/app-func-modal-confirm/app-func-modal-confirm.component';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import {
  EstoqueAlmoxarifadoService,
  FuncionarioGrupoService,
  FuncionarioService,
  LayoutService,
} from '@modules/shared/services';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'environments/environment';
import { EstadoDTO, MunicipioDTO } from '@modules/shared/models/layout.utils';
import {
  FuncionarioDTO,
  FuncionarioEnderecoDTO,
  FuncionarioGrupoDTO,
  FuncionarioPesquisaDTO,
  PageFuncionario,
} from '@modules/shared/models/funcionario';
import { EstoqueAlmoxarifadoDTO } from '@modules/shared/models/item';

@Component({
  selector: 'app-funcionario',
  templateUrl: './funcionario.component.html',
  styleUrls: ['./funcionario.component.scss'],
})
export class FuncionarioComponent implements OnInit {
  ColumnMode = ColumnMode;
  funcionario!: FuncionarioDTO;
  funcionarioPesquisa!: FuncionarioPesquisaDTO;
  pageFuncionario!: PageFuncionario;
  estados: EstadoDTO[] = [];
  municipios: MunicipioDTO[] = [];
  flgBuscandoMunicipio: number;
  grupoFuncionario!: FuncionarioGrupoDTO;
  grupoFuncionarios!: FuncionarioGrupoDTO[];
  supervisores!: FuncionarioDTO[];
  errorForm: any = {};
  authorities!: string[];
  grupoFuncionarioSelected: any = {};
  activeNav: any;
  // status 1 = salvando, status 2 = editando, status 3 = pesquisando
  statusForm: number;
  selectionTypeSingle = SelectionType.single;
  almoxarifados: EstoqueAlmoxarifadoDTO[] = [];
  almoxarifado: EstoqueAlmoxarifadoDTO | null = null;

  foneMask = environment.foneMask;
  cellMask = environment.cellMask;
  cpfMask = environment.cpfMask;
  horaMask = environment.horaMask;

  // datatable
  rows: any[] = [];
  columns: any[] = [{ name: 'ID' }, { name: 'NOME' }, { name: 'STATUS' }];
  selected: any[] = [];
  // datatable

  constructor(
    private spinner: NgxSpinnerService,
    private _modalService: NgbModal,
    private _funcionarioService: FuncionarioService,
    private _pagesService: LayoutService,
    private _grupoFuncionarioService: FuncionarioGrupoService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private _alx: EstoqueAlmoxarifadoService
  ) {
    this.statusForm = 1;
    this.flgBuscandoMunicipio = 0;
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

  searchingSupervisor = false;
  searchFailedSupervisor = false;
  hideSearchingWhenUnsubscribedSupervisor = new Observable(
    () => () => (this.searchingSupervisor = false)
  );

  searchingSetor = false;
  searchFailedSetor = false;
  hideSearchingWhenUnsubscribedSetor = new Observable(
    () => () => (this.searchingSetor = false)
  );

  searchingGrupo = false;
  searchFailedGrupo = false;
  hideSearchingWhenUnsubscribedGrupo = new Observable(
    () => () => (this.searchingGrupo = false)
  );

  formatterSupervisor = (x: { nome: string }) => x.nome;
  formatterSetor = (x: { nome: string }) => x.nome;
  formatterGrupo = (x: { nome: string }) => x.nome;

  searchSupervisor = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.searchingSupervisor = true)),
      switchMap((term) =>
        this._funcionarioService.getSupervisorByName(term).pipe(
          tap(() => (this.searchFailedSupervisor = false)),
          catchError(() => {
            this.searchFailedSupervisor = true;
            return of([]);
          })
        )
      ),
      tap(() => (this.searchingSupervisor = false))
    );

  searchGrupo = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.searchingGrupo = true)),
      switchMap((term) =>
        this._grupoFuncionarioService.findByName(term).pipe(
          tap(() => (this.searchFailedGrupo = false)),
          catchError(() => {
            this.searchFailedGrupo = true;
            return of([]);
          })
        )
      ),
      tap(() => (this.searchingGrupo = false))
    );

  buscaCep(): void {
    this.spinner.show();
    this._pagesService
      .buscaCep(this.funcionario.funcionarioEnderecoDTO!.cep)
      .subscribe({
        next: (data) => {
          this.spinner.hide();
          this.setaCep(data);
          this.pop('success', 'OK', 'Cep encontrado com sucesso.');
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.log(err);
          this.spinner.hide();
          this.pop(
            'error',
            'Erro',
            'Digite um cep valido, erro ao pesquisar!.'
          );
        },
      });
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  isUndefined(value: any): boolean {
    return typeof value === 'undefined';
  }

  buscaMunicipiosPorEstado(estado: EstadoDTO): void {
    if (estado != null) {
      this.flgBuscandoMunicipio = 1;
      this._pagesService.buscaMunicipioPorEstado(estado.uf).subscribe({
        next: (data) => {
          this.flgBuscandoMunicipio = 0;
          this.municipios = data;
          this.cdr.markForCheck();
          // console.log(this.municipios);
        },
        error: () => {
          this.flgBuscandoMunicipio = 0;
          this.pop(
            'error',
            'Erro',
            'Erro ao buscar municipios, contate o administrador.'
          );
        },
      });
    }
  }

  verificaSupervisor(): void {
    if (
      this.funcionario.supervisorDTO == null ||
      !Object.prototype.hasOwnProperty.call(
        this.funcionario.supervisorDTO,
        'id'
      )
    ) {
      this.funcionario.supervisorDTO = null;
      // console.log('nao existe supervisor');
    }
  }
  removeSupervisor(): void {
    this.funcionario.supervisorDTO = null;
  }
  compareEstado(c1: EstadoDTO, c2: EstadoDTO): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  compareMunicipio(c1: MunicipioDTO, c2: MunicipioDTO): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  getAllActiveEstoqueAlmoxarifado(): void {
    this._alx.getAllActive().subscribe({
      next: (data) => {
        this.almoxarifados = data;
        this.cdr.markForCheck();
      },
      error: () => {
        this.pop(
          'error',
          'Erro',
          'Erro ao buscar almoxarifados, contate o administrador.'
        );
      },
    });
  }

  ngOnInit(): void {
    this.iniciaObjs();
    this.buscaUtils();
  }

  iniciaObjs(): void {
    this.funcionario = new FuncionarioDTO();
    // this.funcionario.supervisor = new FuncionarioDTO();
    this.funcionario.funcionarioEnderecoDTO = new FuncionarioEnderecoDTO();

    this.funcionarioPesquisa = new FuncionarioPesquisaDTO();

    this.municipios = [];
    this.estados = [];
    this.funcionario.funcionarioEnderecoDTO.municipioDTO = new MunicipioDTO();
    this.funcionario.funcionarioEnderecoDTO.municipioDTO.id = -1;
    this.funcionario.funcionarioEnderecoDTO.municipioDTO.estadoDTO = null;
    this.funcionario.estoqueAlmoxarifadoDTOs = [];
  }

  buscaUtils(): void {
    this.buscaEstados();
    this.getAllActiveEstoqueAlmoxarifado();
  }

  buscaEstados(): void {
    this._pagesService.buscaEstados().subscribe({
      next: (data) => {
        this.estados = data;
        this.cdr.markForCheck();
        // console.log(this.estados);
      },
      error: () => {
        this.pop(
          'error',
          'Erro',
          'Erro ao buscar estados, contate o administrador.'
        );
      },
    });
  }

  grupoSelecionado(event: any, vGrupoSelecionado: any): void {
    this.grupoFuncionarioSelected = event.item;
    setTimeout(function () {
      vGrupoSelecionado.value = '';
    }, 400);
    this.addGrupo();
  }

  setaCep(data: any): void {
    this.funcionario.funcionarioEnderecoDTO!.cep = data.cep;
    this.funcionario.funcionarioEnderecoDTO!.logradouro = data.logradouro;
    this.funcionario.funcionarioEnderecoDTO!.bairro = data.bairro;
    this.funcionario.funcionarioEnderecoDTO!.cidade = data.cidade;
    this.funcionario.funcionarioEnderecoDTO!.estado = data.uf;
    this.funcionario.funcionarioEnderecoDTO!.numLogradouro = data.numLogradouro;
    this.funcionario.funcionarioEnderecoDTO!.complemento = data.complemento;
    this.funcionario.funcionarioEnderecoDTO!.uf = data.uf;

    this.funcionario.funcionarioEnderecoDTO!.municipioDTO = data.municipioDTO;
    this.municipios.push(this.funcionario.funcionarioEnderecoDTO!.municipioDTO);
    this.cdr.markForCheck();
  }

  compareAlmoxarifado(c1: EstoqueAlmoxarifadoDTO, c2: EstoqueAlmoxarifadoDTO): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
 }

  setPage(pageInfo: any) {
    // console.log(pageInfo);
    this.funcionarioPesquisa.pageSize = pageInfo.pageSize;
    this.funcionarioPesquisa.pageNumber = pageInfo.offset;
    this.pesquisaFuncionario(this.funcionarioPesquisa);
    this.cdr.markForCheck();
  }

  addGrupo(): void {
    // console.log(this.grupoFuncionarioSelected);
    if (
      this.grupoFuncionarioSelected == null ||
      typeof this.grupoFuncionarioSelected.id === 'undefined'
    ) {
      this.pop('error', 'Erro', 'Selecione um grupo primeiro!.');
    } else {
      const filtros = this.funcionario.funcionarioGrupoDTOs.filter((g) => {
        return g.id === this.grupoFuncionarioSelected.id;
      });

      if (filtros.length > 0) {
        this.pop('error', 'Erro', 'Grupo já foi adicionado!.');
      } else {
        this.funcionario.funcionarioGrupoDTOs.push(
          this.grupoFuncionarioSelected
        );
      }
    }
    this.cdr.markForCheck();
  }

  removeGrupo(id: number): void {
    for (let i = 0; i < this.funcionario.funcionarioGrupoDTOs.length; i++) {
      if (this.funcionario.funcionarioGrupoDTOs[i].id === id) {
        this.funcionario.funcionarioGrupoDTOs.splice(i, 1);
        i = this.funcionario.funcionarioGrupoDTOs.length + 1;
      }
    }
    this.pop('success', 'OK', 'Grupo removido!');
    this.cdr.markForCheck();
  }

  isSupervisor(): boolean {
    return this.funcionario.supervisorDTO != null &&
      Object.prototype.hasOwnProperty.call(this.funcionario.supervisorDTO, 'id')
      ? true
      : false;
  }

  /*
    isSetor(): boolean {
        return this.funcionario.vendedorSetorDTOs != null
        && this.funcionario.vendedorSetorDTOs.length > 0 ? true : false;
    }
    */
  onPesquisa(): void {
    this.funcionarioPesquisa.funcionarioDTO = this.funcionario;
    this.pesquisaFuncionario(this.funcionarioPesquisa);
  }

  pesquisaFuncionario(funcionarioPesquisaDTO: FuncionarioPesquisaDTO): void {
    this.selected = [];
    this.rows = [];

    console.log(funcionarioPesquisaDTO);

    this.spinner.show();
    this._funcionarioService.find(funcionarioPesquisaDTO).subscribe({
      next: (data) => {
        //console.log(data);
        this.spinner.hide();
        this.pageFuncionario = data;
        if (this.pageFuncionario.content.length === 0) {
          this.pop(
            'error',
            'Pesquisa',
            'Não foi encontrado nada com essa pesquisa.'
          );
        } else if (this.pageFuncionario.content.length === 1) {
          this.pop('success', 'Pesquisa', 'Encontrado apenas 1.');
          this.setaFuncionario(this.pageFuncionario.content[0]);
          this.statusForm = 2;
        } else {
          this.statusForm = 3;
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.spinner.hide();
        // console.log(err);
      },
    });
  }

  setaFuncionario(funcionario: FuncionarioDTO): void {
    this.funcionario = funcionario;
    this.municipios.push(this.funcionario.funcionarioEnderecoDTO!.municipioDTO);
  }

  onDeleta(id: number): void {
    const activeModal = this._modalService.open(AppFuncModalConfirmComponent);
    activeModal.componentInstance.modalHeader = 'Confirme a exclusão';
    activeModal.componentInstance.modalContent = 'Deseja realmente excluir ?';
    activeModal.componentInstance.modalType = 'confirm';
    activeModal.componentInstance.defaultLabel = 'Não';
    activeModal.result.then(
      (result) => {
        if (result === 'confirm') {
          let message = '';
          this.spinner.show();
          this._funcionarioService.del(id).subscribe({
            next: () => {
              // message = resp.message;
              // this.pop('success', 'Sucesso', message);
              this.spinner.hide();
              this.rows = [];
              this.onLimpa();
              this.cdr.markForCheck();
            },
            error: (err) => {
              this.spinner.hide();
              message = err.message;
              this.pop('error', 'Erro', message);
            },
          });
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  onLimpa(): void {
    this.limpa();
    this.cdr.markForCheck();
  }

  onCadastra(): void {
    //console.log(this.funcionario);
    this.funcionario.hrIniEmissaoVendaAm = this.formataHora(
      this.funcionario.hrIniEmissaoVendaAm
    );
    this.funcionario.hrFimEmissaoVendaAm = this.formataHora(
      this.funcionario.hrFimEmissaoVendaAm
    );
    this.funcionario.hrIniEmissaoVendaPm = this.formataHora(
      this.funcionario.hrIniEmissaoVendaPm
    );
    this.funcionario.hrFimEmissaoVendaPm = this.formataHora(
      this.funcionario.hrFimEmissaoVendaPm
    );

    console.log(this.funcionario);
    this.spinner.show();
    this._funcionarioService
      .postOrPut(this.funcionario, this.statusForm)
      .subscribe({
        next: (data) => {
          this.spinner.hide();
          this.funcionario = data;
          // this.pop('success', 'Sucesso', 'Requisição realizada sucesso.');
          this.errorForm = {};
          this.statusForm = 2;
          this.rows = [];
          this.cdr.markForCheck();
        },
        error: (err) => {
          if (
            Object.prototype.hasOwnProperty.call(err, 'error') &&
            err.error != null
          ) {
            this.errorForm = err.error;
          }
          this.spinner.hide();
          this.pop('error', 'Erro', 'Erro ao realizar requisição');
          this.cdr.markForCheck();
        },
      });
  }

  formataHora(hora: string): string {
    return hora != null && hora.indexOf('_') === -1 ? hora : '00:00';
  }
  editando(): void {
    // console.log('selecionando para editar');
    const sel = this.pageFuncionario.content.filter((us) => {
      return us.id === this.selected[0].id;
    });
    this.setaFuncionario(sel[0]);
    this.statusForm = 2;
    this.cdr.markForCheck();
  }

  adicionaAlmoxarifado(): void {
    console.log(this.almoxarifado);
    if (this.almoxarifado != null && this.isUndefined(this.almoxarifado.id) === false){
      const filtros = this.funcionario.estoqueAlmoxarifadoDTOs.filter((g) => {
        return g.id === this.almoxarifado!.id;
      });

      if (filtros.length > 0) {
        this.pop('error', 'Erro', 'Almoxarifado já foi adicionado!');
      } else {
        this.funcionario.estoqueAlmoxarifadoDTOs.push(this.almoxarifado);
        this.funcionario.estoqueAlmoxarifadoDTOs = [...this.funcionario.estoqueAlmoxarifadoDTOs];
        this.almoxarifado = null;
      }
    } else {
      this.pop('error', 'Erro', 'Selecione um almoxarifado primeiro!');
    }
    this.cdr.markForCheck();
  }

  removeAlmoxarifado(id: number): void {
    for (let i = 0; i < this.funcionario.estoqueAlmoxarifadoDTOs.length; i++) {
      if (this.funcionario.estoqueAlmoxarifadoDTOs[i].id === id) {
        this.funcionario.estoqueAlmoxarifadoDTOs.splice(i, 1);
        this.funcionario.estoqueAlmoxarifadoDTOs = [...this.funcionario.estoqueAlmoxarifadoDTOs];

        this.pop('success', 'OK', 'Almoxarifado removido!');
        this.cdr.markForCheck();
        break;
      }
    }
   
  }

  existsAlmoxarifados(): boolean {
    return this.funcionario.estoqueAlmoxarifadoDTOs != null && this.funcionario.estoqueAlmoxarifadoDTOs.length > 0;
  }

  isValidDelete(): boolean {
    return this.statusForm === 2 && this.funcionario.id != null ? false : true;
  }

  setaColumns(funcionarios: FuncionarioDTO[]): void {
    if (funcionarios.length === 1) {
      this.funcionario = funcionarios[0];
      this.statusForm = 2;
      this.pop('success', 'Encontrado apenas 1 registro', '');
    } else {
      this.rows = [];
      for (let i = 0; i < funcionarios.length; i++) {
        this.rows.push({
          id: funcionarios[i].id,
          nome: funcionarios[i].nome,
          status: funcionarios[i].status === true ? 'Ativo' : 'Desativado',
        });
      }
    }
  }

  onLeftArray(): void {
    if (this.statusForm === 2) {
      for (let i = 0; i < this.pageFuncionario.content.length; i++) {
        if (this.funcionario.id === this.pageFuncionario.content[i].id) {
          if (i - 1 >= 0) {
            this.selected = [];
            this.funcionario = this.pageFuncionario.content[i - 1];
            i = this.pageFuncionario.content.length + 1;
            this.selected.push(this.funcionario);
          }
        }
      }
    }
  }

  onRightArray(): void {
    if (this.statusForm === 2) {
      for (let i = 0; i < this.pageFuncionario.content.length; i++) {
        if (this.funcionario.id === this.pageFuncionario.content[i].id) {
          if (i + 1 < this.pageFuncionario.content.length) {
            this.selected = [];
            this.funcionario = this.pageFuncionario.content[i + 1];
            i = this.pageFuncionario.content.length + 1;
            this.selected.push(this.funcionario);
          }
        }
      }
    }
  }

  voltar(): void {
    if (this.funcionario.id > 0) {
      this.statusForm = 2;
    } else {
      this.statusForm = 1;
    }
  }

  onTable(): void {
    // console.log('teste');
    if (
      this.pageFuncionario != null &&
      this.pageFuncionario.content != null &&
      this.pageFuncionario.content.length > 0
    ) {
      this.statusForm = 3;
    } else {
      this.pop('error', 'Erro', 'Procure primeiro.');
    }
  }

  limpa(): void {
    this.iniciaObjs();
    this.buscaUtils();
    this.statusForm = 1;
    this.errorForm = {};
    this.selected = [];
  }
  onActivate(event: any) {
    if (
      event.type === 'dblclick' ||
      (event.type === 'keydown' && event.event.keyCode === 13)
    ) {
      this.editando();
    }
    this.cdr.markForCheck();
  }
}
