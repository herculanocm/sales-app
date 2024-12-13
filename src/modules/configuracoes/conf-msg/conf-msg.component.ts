import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfGeraisService } from '@modules/shared/services';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';


@Component({
    selector: 'app-conf-msg',
    templateUrl: './conf-msg.component.html',
    styleUrls: ['./conf-msg.component.scss']
})
export class ConfMsgComponent implements OnInit {

    submitted = false;
    msgForm = new FormGroup({
        id: new FormControl<number | null>(null),
        msg: new FormControl<string | null>(null, [Validators.required]),
        alwaysOnLogin: new FormControl<boolean | null>(false),
        firstOnly: new FormControl<boolean | null>(false)
    })

    editorConfig: any = {
        editable: true,
        spellcheck: true,
        height: 'auto',
        minHeight: '0',
        maxHeight: 'auto',
        width: 'auto',
        minWidth: '0',
        translate: 'yes',
        enableToolbar: true,
        showToolbar: true,
        placeholder: 'Enter text here...',
        defaultParagraphSeparator: '',
        defaultFontName: '',
        defaultFontSize: '',
        fonts: [
            { class: 'arial', name: 'Arial' },
            { class: 'times-new-roman', name: 'Times New Roman' },
            { class: 'calibri', name: 'Calibri' },
            { class: 'comic-sans-ms', name: 'Comic Sans MS' }
        ],
        customClasses: [
            {
                name: 'quote',
                class: 'quote',
            },
            {
                name: 'redText',
                class: 'redText'
            },
            {
                name: 'titleText',
                class: 'titleText',
                tag: 'h1',
            },
        ],
        sanitize: true,
        toolbarPosition: 'top',
        toolbarHiddenButtons: [
            [],
            [ 'insertImage',
            'insertVideo']
        ]
    };

    constructor(
        private _confService: ConfGeraisService,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef,
        private spinner: NgxSpinnerService) { }

    async ngOnInit(): Promise<void> {
        this.spinner.show();
        this.msgForm.controls['id'].disable();
        await this.iniciaObjs();
        this.spinner.hide();
    }

    async iniciaObjs(): Promise<void> {
        const confMsg: any = await lastValueFrom(this._confService.getConfMsg());
        this.msgForm.patchValue(confMsg);
    }

    onCadastra(): void {
        this.submitted = true;
        if (this.msgForm.invalid) {
            this.toastr.error('Atenção aos campos', '');
        } else {
            this.spinner.show();
            const msgBody: any = this.msgForm.getRawValue();
            this._confService.saveConfMsg(msgBody)
                .subscribe({
                    next: (data) => {
                        this.spinner.hide();
                        this.msgForm.patchValue(data);
                        this.toastr.success('Salvo com sucesso', '');
                    },
                    error: (err) => {
                        console.log(err);
                        this.spinner.hide();
                        this.toastr.error('Contate o administrador', 'ERRO');
                    }
                });
        }
    }

    get f() { return this.msgForm.controls; }

    onLimpa(): void {
        this.submitted = false;
        this.msgForm.reset();
        this.msgForm.enable();
        this.msgForm.patchValue(
            {
                alwaysOnLogin: false,
                firstOnly: false
            }
        );
        this.msgForm.controls['id'].disable();
    }
}
