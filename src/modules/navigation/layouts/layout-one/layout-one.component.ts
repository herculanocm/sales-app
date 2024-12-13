import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    Input,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { NavigationService } from '@modules/navigation/services';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-layout-one',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './layout-one.component.html',
    styleUrls: ['layout-one.component.scss'],
})
export class LayoutOneComponent implements OnInit, OnDestroy {

    @Input() static = false;
    @Input() light = false;
    @Input() rtl = false;
    @HostBinding('class.sidenav-toggled') sideNavHidden = false;
    subscription: Subscription = new Subscription();

    constructor(
        public navigationService: NavigationService,
        private changeDetectorRef: ChangeDetectorRef
    ){
    }

    ngOnInit(): void {
        this.subscription.add(
            this.navigationService.sideNavVisible$().subscribe((isVisible) => {
                console.log('isVisible', isVisible);
                this.sideNavHidden = !isVisible;
                this.changeDetectorRef.markForCheck();
            })
        );
    }
    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    toggleSideNav() {
        this.navigationService.toggleSideNav();
    }

    closeSideNavIfOpen() {
        if (window.innerWidth >= 992) {
            return;
        }
        // After the lg breakpoint, hidden is actually visible.
        // So the toggleSideNav below only will fire if the screen is < 992px
        // and the sideNav is open.
        if (this.sideNavHidden) {
            this.navigationService.toggleSideNav();
        }
    }
}