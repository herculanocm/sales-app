import { Component, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppConfigModalConfirmComponent } from '../modals/app-config-modal-confirm/app-config-modal-confirm.component';
import { ExecutorService } from '@modules/shared/services';

@Component({
  selector: 'app-conf-executor',
  templateUrl: './executor.component.html',
  providers: [],
})
export class ExecutorComponent {
  constructor(
    private _executorService: ExecutorService,
    private _modalService: NgbModal,
    private spinner: NgxSpinnerService,
    private cdr: ChangeDetectorRef
  ) {}

  atualizaLatLongEnderecos(): void {
    this._executorService.atualizaLatLongEnderecos().subscribe(
      (data) => {
        console.log(data);
        this.cdr.detectChanges();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  deployNG(): void {
    this._executorService.deployNG().subscribe({
      next: (data) => {
        console.log(data);
        this.msgAlerta('Atenção', 'Executado com sucesso', 'success');
      },
      error: (err) => {
        console.log(err);
        this.msgAlerta('Atenção', 'Erro ao executar', 'error');
      },
    });
  }

  deployAPI(): void {
    this._executorService.deployAPI().subscribe({
      next: (data) => {
        console.log(data);
        this.msgAlerta('Atenção', 'Executado com sucesso', 'success');
      },
      error: (err) => {
        console.log(err);
        this.msgAlerta('Atenção', 'Erro ao executar', 'error');
      },
    });
  }

  backupPostgres(): void {
    this.spinner.show();
    this._executorService.backupPostgres().subscribe({
      next: (resp) => {
        this.spinner.hide();
        console.log(resp);
        this.msgAlerta('Atenção', 'Executado com sucesso', 'success');
      },
      error: (err) => {
        this.spinner.hide();
        console.log(err);
        this.msgAlerta('Atenção', 'Erro ao executar', 'error');
      },
    });
  }

  copyTitulosWinthor(): void {
    this.spinner.show();
    this._executorService.copyTitulosWinthor().subscribe({
      next: (resp) => {
        this.spinner.hide();
        console.log(resp);
        this.msgAlerta('Atenção', 'Executado com sucesso', 'success');
      },
      error: (err) => {
        this.spinner.hide();
        console.log(err);
        this.msgAlerta('Atenção', 'Erro ao executar', 'error');
      },
    });
  }

  atualizarPlanilhaVendas(): void {
    // const dataExecution = new Date();
    // this._executorService.atualizarPlanilhaVendas(dataExecution)
    //     .subscribe((data) => {
    //         this.msgAlerta('Atenção', `A execução foi acionada com sucesso para exportação da
    //     planilha de vendas, aguarde no mínimo 30 minutos para ela acontecer, não acione novamente o botão`,
    //             'danger');
    //     }, (error) => {
    //         this.msgAlerta('Atenção', `Erro ao acionar, contate o administrador`,
    //             'danger');
    //     });
    this.spinner.show();
    this._executorService.executaProcessoVendas().subscribe(
      (data) => {
        this.spinner.hide();
        console.log(data);
        this.msgAlerta('Atenção', 'Executado com sucesso', 'success');
        this.cdr.detectChanges();
      },
      (error) => {
        this.spinner.hide();
        console.log(error);
        this.msgAlerta(
          'Atenção',
          `Erro ao acionar, contate o administrador`,
          'danger'
        );
        this.cdr.detectChanges();
      }
    );
  }

  bloqueioClientesInadimplentes(): void {
    this.spinner.show();
    this._executorService.bloqueioClientesInadimplentes()
    .subscribe({
      next: (data) => {
        console.log(data);
        this.spinner.hide();
        this.msgAlerta('Atenção', 'Executado com sucesso', 'success');
      },
      error: (err) => {
        console.log(err);
        this.spinner.hide();
        this.msgAlerta('Erro', 'Erro ao executar', 'error');
      }
    });
  }

  desbloqueioClientesInadimplentes(): void {
    this.spinner.show();
    this._executorService.desbloqueioClientesInadimplentes()
    .subscribe({
      next: (data) => {
        console.log(data);
        this.spinner.hide();
        this.msgAlerta('Atenção', 'Executado com sucesso', 'success');
      },
      error: (err) => {
        console.log(err);
        this.spinner.hide();
        this.msgAlerta('Erro', 'Erro ao executar', 'error');
      }
    });
  }

  msgAlerta(titulo: string, conteudo: string, tipo: string): void {
    const activeModal = this._modalService.open(
      AppConfigModalConfirmComponent,
      { backdrop: true }
    );
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
}
