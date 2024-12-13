import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AppService } from '@app/app.service';

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const _appService = inject(AppService);

    if (_appService.isLoggedAndConfigsSession() === false && // se já perdeu os dados da sessão
        _appService.isLoggedAndConfigsLocal() // e existe os dados no local storage
    ) {
        // alert('copiando de local para session');
        _appService.localParaSession();
    }

    if (_appService.isLoggedAndConfigsSession()) {
        return true;
    } else {
        // alert('sem acesso a rota, realize o login novamente erro: canActivate');
        router.navigate(['auth', 'logout']);
        return false;
    }
};
