import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
    selector: 'app-head-compact',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './head-compact.component.html',
    styleUrls: ['head-compact.component.scss'],
})
export class HeadCompactComponent {
    @Input() icon!: string;
    @Input() title!: string;
    @Input() light = true;

    darkClasses = ['page-header-dark', 'bg-gradient-primary-to-secondary'];
    lightClasses = ['page-header-light', 'bg-white', 'shadow'];
}
