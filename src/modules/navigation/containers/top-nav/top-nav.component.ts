import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AuthUtilsService } from '@modules/auth-utils/auth-utils.service';
import { UserSales } from '@modules/auth-utils/auth.utils';
import { NavigationService } from '@modules/navigation/services';

@Component({
    selector: 'app-top-nav',
    templateUrl: './top-nav.component.html',
    styleUrls: ['top-nav.component.scss'],
})
export class TopNavComponent implements OnInit, AfterViewInit {

    @Input() 
    placement = 'bottom-end';
    
    dropdownClasses: string[] = [];
    profile!: UserSales;
    
    constructor(
        public navigationService: NavigationService,
        private authUtilsService: AuthUtilsService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        
            this.profile = {
                id: -1,
                login: 'carregando',
                firstName: 'Carregando',
                lastName: 'Carregando',
                email: 'carregando@carregando',
                imageUrl: '',
                activated: true,
                langKey: '',
                createdBy: '',
                createdDate: new Date(),
                lastModifiedBy: '',
                lastModifiedDate: new Date(),
                authorityDTOs: []
            };      
    }

    ngAfterViewInit(): void {
        const user = this.authUtilsService.getAccountFromLocalStorage();
        console.log(user);
        if (user.user !== null && !this.isUndefined(user.user) && user.user !== null) {
            this.profile = user.user;
           // this.cdr.markForCheck();
        }
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
    }
    
    isUndefined(value: any): boolean {
        return typeof(value) === 'undefined';
    }

    toggleSideNav() {
        this.navigationService.toggleSideNav();
    }
}
