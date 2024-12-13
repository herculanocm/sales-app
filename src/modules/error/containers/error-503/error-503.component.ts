import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-error-503',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './error-503.component.html',
    styleUrls: ['error-503.component.scss'],
})
export class Error503Component { }
