import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-page-header',
    templateUrl: './page-header.component.html',
    styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent {
    @Input() heading!: string;
    @Input() pheading: string;
    @Input() icon!: string;
    @Input() picon: string;

    constructor() {
        this.picon = 'fa-dashboard';
        this.pheading = 'Dashboard';
    }
}
