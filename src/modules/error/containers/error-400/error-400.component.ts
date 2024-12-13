import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-error-400',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './error-400.component.html',
    styleUrls: ['error-400.component.scss'],
})
export class Error400Component { }

