import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {
    Router, Event, NavigationStart, RoutesRecognized,
    RouteConfigLoadStart, RouteConfigLoadEnd,
    NavigationEnd, NavigationCancel, NavigationError
} from '@angular/router';
import { SideNavItem, SideNavItems, SideNavSection } from '@modules/navigation/models';
import { NavigationService } from '@modules/navigation/services';
import { sideNavItems } from '@modules/navigation/data/side-nav-dashboard.data';
import { MenuReport } from '@modules/customizations/customizations.utils';
import { AuthUtilsService } from '@modules/auth-utils/auth-utils.service';
import { CurrentUserSalesAppAux } from '@app/app.utils';

@Component({
    selector: 'app-side-nav',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './side-nav.component.html',
    styleUrls: ['side-nav.component.scss'],
})
export class SideNavComponent implements OnInit, OnDestroy {
    @Input() sidenavStyle!: string;
    sideNavItems!: SideNavItems;
    sideNavSections: SideNavSection[] = [];

    sideNavItemsDashboards: SideNavItems = {};
    sideNavSectionDashboards: SideNavSection[] = [];

    subscription: Subscription = new Subscription();
    routeDataSubscription!: Subscription;
    roles: string[] = [];
    currentUserSalesApp!: CurrentUserSalesAppAux;

    constructor(
        public navigationService: NavigationService,
        public router: Router,
        private cdr: ChangeDetectorRef,
        public authUtilsService: AuthUtilsService,
        ) {
            this.roles = this.authUtilsService.getRolesFromDecodedToken();
            router.events.subscribe((val: Event) => {

                if (val instanceof NavigationStart) {
                    // Navigation started.
                    // console.log(val.url);
                } else if (val instanceof RoutesRecognized) {
                    // Router parses the URL and the routes are recognized.
                    // console.log('RoutesRecognized');
                    // this.setLoadingByUrl(val.url);
                } else if (val instanceof RouteConfigLoadStart) {
                    // Before the Router lazyloads a route configuration.
                    // console.log('RouteConfigLoadStart');
                } else if (val instanceof RouteConfigLoadEnd) {
                    // Route has been lazy loaded.
                    // console.log('RouteConfigLoadEnd');
                } else if (val instanceof NavigationEnd) {
                    // Navigation Ended Successfully.
                    // this.disableLoadingMenu();
    
                    // this.toggleCollapsed();
                    // this.toggleSidebar();
                } else if (val instanceof NavigationCancel) {
                    // Navigation is canceled as the Route-Guard returned false during navigation.
                } else if (val instanceof NavigationError) {
                    // Navigation fails due to an unexpected error.
                    // console.log(val.error);
                }
    
                if (
                    val instanceof NavigationEnd &&
                    window.innerWidth <= 1200
                ) {
                    this.navigationService.toggleSideNav();
                }
            });
        }

    ngOnInit() {
        this.currentUserSalesApp = JSON.parse(sessionStorage.getItem('currentUserSalesApp')!);
        const authorityDTOs = this.currentUserSalesApp.user.authorityDTOs;
        // console.log(authorityDTOs);

        const sideNavItems1 = this.verificaAcessos(sideNavItems, authorityDTOs);
        // console.log(sideNavItems1);
        this.sideNavItems = this.aplicaChildrens(sideNavItems1, authorityDTOs);

        const sideNavSectionsInit: SideNavSection[] = [
            {
                text: 'MENU',
                items: Object.keys(this.sideNavItems),
            }
        ];
        this.sideNavSections = sideNavSectionsInit;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }


    menuToSideNavItens(menus: MenuReport[]): void {
        const section: SideNavSection = {
            text: 'DASHBOARDS',
            items: [],
            roles: ['ROLE_ADMIN', 'ROLE_EDITOR', 'ROLE_USER']
        }; 

        menus.sort((obj1, obj2) => {
            if (obj1.orderView === null && obj2.orderView === null) {
                // If both orderView properties are null, compare by name
                if (obj1.text > obj2.text) {
                    return 1;
                } else if (obj1.text < obj2.text) {
                    return -1;
                }
                return 0;
            } else if (obj1.orderView === null) {
                // If obj1.orderView is null, place it after obj2
                return 1;
            } else if (obj2.orderView === null) {
                // If obj2.orderView is null, place it before obj1
                return -1;
            } else {
                // Compare by orderView for both objects
                return obj1.orderView - obj2.orderView;
            }
        });

        menus.forEach(m => {
            const i: SideNavItem = {
                text: m.text,
                icon: m.icon == null ? 'list': m.icon,
                ordem: m.orderView == null ? 1 : m.orderView,
                roles: ['ROLE_ADMIN', 'ROLE_EDITOR', 'ROLE_USER'],
                submenu: [],
            };

            m.subMenuReports.forEach(sm => {
                i.submenu?.push(
                    {
                    text: sm.text,
                    ordem: sm.orderView == null ? 1 : m.orderView,
                    link: '/pages/dashboards/report',
                    updated: false,
                    roles: ['ROLE_ADMIN', 'ROLE_EDITOR', 'ROLE_USER'],
                    rid: sm.id,
                    pkid: sm.pkid,
                    params: {
                        rnm: sm.text, 
                        rid: sm.id, 
                        grid: sm.workspace!.id,
                        mrid: m.id,
                        pkid: sm.pkid,
                    },
                    }
                );
            });
            this.sideNavItemsDashboards[i.text] = i;
            section.items!.push(i.text);
        });

        this.sideNavSectionDashboards.push(section);
        this.cdr.detectChanges();
    }

    getSideNavSectionsByRoles(sideNavSection: SideNavSection[], userAuthoritiesRoles: string[], sideNavItems: SideNavItems): SideNavSection[] {
        const sideNavItemsNames: string[] = [];
        for (const key in sideNavItems) {
            sideNavItemsNames.push(key);
        }
        
        const flt: SideNavSection[] = sideNavSection.filter(sn => {
            return sn.roles !== undefined && 
            sn.roles!.length > 0 && 
            this.isRolesinRoles(sn.roles!, userAuthoritiesRoles);
        });

        if (flt.length > 0) {
            flt.forEach(flti => {
                flti.items = flti.items!.filter(flti_filter => {
                    return sideNavItemsNames.includes(flti_filter);
                });
            });
        }



        return flt.filter(flt2 => { return flt2.items!.length > 0; });
    }

    isRolesinRoles(rolesCheck: string[], roles: string[]): boolean {
        return roles.some(role => rolesCheck.includes(role));
    }

    getSideNavItems(sideNavItems: SideNavItems, userAuthoritiesRoles: string[]): SideNavItems {
        sideNavItems = this.getSideNavItemsByRoles(sideNavItems, userAuthoritiesRoles);
        for (const key in sideNavItems) {
            sideNavItems[key]!.submenu = sideNavItems[key]!.submenu?.filter(subm => {
                return this.isRolesinRoles(subm.roles!, userAuthoritiesRoles);
            });
        }
        return sideNavItems;
    }

    getSideNavItemsByRoles(sideNavItems: SideNavItems, userAuthoritiesRoles: string[]): SideNavItems {
        const newMenu: SideNavItems = {};

        for (const key in sideNavItems) {

            if (sideNavItems[key]!.roles !== undefined) {
                if (this.isRolesinRoles(sideNavItems[key]!.roles!, userAuthoritiesRoles)) {
                    newMenu[key] = sideNavItems[key];
                }
            }

        }

        return newMenu;
    }
    verificaAcessos(menus: SideNavItems, roles: any[]): SideNavItems {
        // console.log('roles');
        // console.log(roles);

        // console.log('menus');
        // console.log(menus);
        const newMenu: SideNavItems = {};

        Object.keys(menus).forEach(key => {
            const carrega = menus[key]!.roles!.filter((role: string) => {
                return role === 'ROLE_ANY' || (
                    roles.filter(roleUser => {
                        return roleUser.name === role;
                    })
                ).length > 0;
            });
            if (carrega.length > 0) {
                newMenu[key] = menus[key];
            }
          });

        return newMenu;
        // return menus.filter(menu => {
        //     return (
        //         menu.roles.filter((role: string) => {
        //             return role === 'ROLE_ANY' || (
        //                 roles.filter(roleUser => {
        //                     return roleUser.name === role;
        //                 })
        //             ).length > 0;
        //         })
        //     ).length > 0;
        // });
    }
    aplicaChildrens(menus: SideNavItems, roles: any[]): SideNavItems {

        const keys = Object.keys(menus);

        for (let i = 0; i < keys.length; i++) {
            const submenus = menus[keys[i]]!.submenu;
            const submenusVerificados: SideNavItem[] = [];

            submenus?.forEach(submenu => {
                const carrega = submenu.roles!.filter((role: string) => {
                    return role === 'ROLE_ANY' || (
                        roles.filter(roleUser => {
                            return roleUser.name === role;
                        })
                    ).length > 0;
                });
                if (carrega.length > 0) {
                    submenusVerificados.push(submenu);
                }
              });
              menus[keys[i]]!.submenu = submenusVerificados;

        }

        return menus;
    }
}
