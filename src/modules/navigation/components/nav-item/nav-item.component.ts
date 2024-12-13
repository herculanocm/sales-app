import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { RouteData, SideNavItem } from '@modules/navigation/models';
import { NavigationService, SideNavService } from '@modules/navigation/services';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-side-nav-item',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './nav-item.component.html',
    styleUrls: ['nav-item.component.scss'],
})
export class SideNavItemComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('collapsibleSection') collapsibleSection!: ElementRef<HTMLDivElement>;

    @Input() sideNavItem!: SideNavItem | null;
    @Input() hierarchy: string[] = [];

    isActive = false;
    collapsed = false;
    routeData!: RouteData;
    navElement!: HTMLDivElement;
    id!: string;
    hierarchyExtension!: string[];
    subscription: Subscription = new Subscription();
    afterViewInit = false;
    reportId!: number;

    constructor(
        public navigationService: NavigationService,
        private sideNavService: SideNavService,
        private router: Router,
        private changeDetectorRef: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.id = this.sideNavService.hashObject(this.sideNavItem);
        this.hierarchyExtension = [...this.hierarchy, this.id];

        this.subscription.add(
            this.sideNavService.expand$.subscribe((ids: any[]) => {
                const thisIDisInExpandedHierarchy = !!ids.find((id) => id === this.id);
                const sameLevel = ids.length === this.hierarchyExtension.length;

                if (!thisIDisInExpandedHierarchy && sameLevel) {
                    if (!this.collapsed) {
                        this.collapse();
                    }
                }
            })
        );
        this.subscription.add(
            this.navigationService
                .currentURL$()
                .subscribe((currentURL) => {
                    //console.log('subs navigation service', currentURL);
                    this.determineIfActive(currentURL.replace(/#.*$/, ''), this.sideNavItem)
                }
                )
        );
    }

    ngAfterViewInit() {
        this.afterViewInit = true;
        this.navElement = this.collapsibleSection.nativeElement;
        //console.log(this.collapsed);
        this.navElement.addEventListener('transitionend', (event) => {
            if (!this.collapsed) {
                // console.log('collapsed');
                this.navElement.style.height = '';
            }
        });

        if (this.isActive) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    determineIfActive(url: string, sideNavItem: SideNavItem | null) {
        const queryParams = this.getParamsFromUrl(url);
        if (queryParams &&
            Object.prototype.hasOwnProperty.call(queryParams, 'rid')) {
            this.reportId = +queryParams['pkid'];
        }

        this.isActive = false;
        this.changeDetectorRef.markForCheck();
        if (sideNavItem!.link) {
            if (
                url === sideNavItem!.link ||
                (
                    queryParams['pkid'] &&
                    (+queryParams['pkid']) > 0 &&
                    (+queryParams['pkid']) === sideNavItem!.pkid
                )
            ) {
                this.isActive = true;
            }
            this.changeDetectorRef.markForCheck();
        }
        if (sideNavItem!.submenu) {
            sideNavItem!.submenu.forEach((submenu) => this.determineIfActiveParent(url, submenu, queryParams));
        }
    }

    determineIfActiveParent(url: string, sideNavItem: SideNavItem, queryParams: Record<string, string>) {
        if (
            sideNavItem.link && url === sideNavItem.link ||
            (
                queryParams['pkid'] &&
                (+queryParams['pkid']) > 0 &&
                (+queryParams['pkid']) === sideNavItem.pkid
            )
        ) {
            this.isActive = true;
            if (this.afterViewInit) {
                this.expand();
            }
            this.changeDetectorRef.markForCheck();
        }
        if (sideNavItem.submenu) {
            sideNavItem.submenu.forEach((submenu) => this.determineIfActiveParent(url, submenu, queryParams));
        }
    }

    toggle() {
        if (this.sideNavItem!.link) {
            this.sideNavService.saveCache(this.hierarchyExtension, this.sideNavItem!.link);
            this.router.navigate([this.sideNavItem!.link], { queryParams: this.sideNavItem!.params });
            return;
        }

        if (this.collapsed) {
            return this.expand();
        }
        return this.collapse();
    }

    collapse() {
        this.sideNavService.setExpanded(this.id, false);
        const navHeight = this.navElement.scrollHeight;
        const elementTransition = this.navElement.style.transition;
        this.navElement.style.transition = '';
        requestAnimationFrame(() => {
            this.navElement.style.height = navHeight + 'px';
            this.navElement.style.transition = elementTransition;
            requestAnimationFrame(() => {
                this.navElement.style.height = 0 + 'px';
                this.collapsed = true;
                this.changeDetectorRef.markForCheck();
            });
        });

    }

    getParamsFromUrl(url: string): Record<string, string> {
        const params: Record<string, string> = {};
        const queryString = url.split('?')[1];

        if (queryString) {
            const keyValuePairs = queryString.split('&');

            keyValuePairs.forEach((pair) => {
                const [key, value] = pair.split('=');
                params[key] = decodeURIComponent(value);
            });
        }

        return params;
    }

    expand() {
        this.sideNavService.setExpanded(this.id, true);
        this.navElement.style.height = this.navElement.scrollHeight + 'px';
        this.collapsed = false;
        this.sideNavService.expand$.next(this.hierarchyExtension);
    }
}
