import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserDTO } from '@modules/shared/models/usuario';
import { UsuarioService } from '@modules/shared/services';

export class MsgUtils {
    msg!: string;
    loading!: boolean;
}



@Component({
    selector: 'app-acessos-modal-clone',
    templateUrl: './app-acessos-modal-clone.component.html',
    styleUrls: ['./app-acessos-modal-clone.component.scss']
})
export class AppAcessosModalCloneComponent implements OnInit {
    @Input() modalHeader: string;
    usuarios!: UserDTO[];
    userClone!: UserDTO | null;
    userRecebedor!: UserDTO | null;
    msgUtils!: MsgUtils;
    constructor(
        public activeModal: NgbActiveModal,
        private _usuarioService: UsuarioService
    ) {
        this.modalHeader = 'Header';
    }

    ngOnInit(): void {
        this.usuarios = [];
        this.userClone = null;
        this.userRecebedor = null;
        this.msgUtils = new MsgUtils();
        this.msgUtils.msg =
            'Buscando os usuários, aguarde...';
        this.buscaTodosUsuarios();
    }

    buscaTodosUsuarios(): void {
        this._usuarioService.getUsers()
        .subscribe((data) => {
            this.usuarios = data;
            this.msgUtils.msg =
            'Selecione o usuário de origem e destino';

            this.usuarios.sort((obj1, obj2) => {
                if (obj1.login > obj2.login) {
                    return 1;
                }
                if (obj1.login < obj2.login) {
                    return -1;
                }
                return 0;
            });

        }, (error) => {
            this.msgUtils.msg =
            'Error ao buscar usuários';
        });
    }

    clonar(): void {
        if (this.userClone == null || this.userRecebedor == null) {
            this.msgUtils.msg =
            'Atenção, para clonar é necessário que o usuário de orgiem e destino estejam selecionados';
        } else {
            this.msgUtils.msg =
            'Clonando aguarde...';
            this.userRecebedor.authorityDTOs = this.userClone.authorityDTOs;
            this._usuarioService.postOrPutUser(this.userRecebedor, 2)
            .subscribe(async (data) => {
                this.msgUtils.msg =
            'Acessos clonados com sucesso!';
            await this.delay(1000);
            this.activeModal.close();
            }, (error) => {
                this.msgUtils.msg =
            'Erro ao atualizar o usuário';
            });
        }
    }

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
