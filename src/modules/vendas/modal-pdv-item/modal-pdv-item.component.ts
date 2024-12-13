import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ItemService } from '@modules/shared/services';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  Observable,
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
  tap,
} from 'rxjs';

@Component({
  selector: 'app-modal-pdv-item',
  templateUrl: './modal-pdv-item.component.html',
  styleUrls: ['./modal-pdv-item.component.scss'],
})
export class ModalPdvItemComponent implements AfterViewInit {

  
  @ViewChild('searchItem')
  searchItem: ElementRef | undefined;

  searchingItemNome!: boolean;
  searchFailedItemNome!: boolean;

  formatterItem = (x: { nome: string }) => x.nome;

  searchItemNome = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(() => {
        this.searchingItemNome = true;
      }),
      switchMap((term) =>
        this._itemService.nodejsFindByName(term).pipe(
          tap(() => (this.searchFailedItemNome = false)),
          catchError(() => {
            this.searchFailedItemNome = true;
            return of([]);
          })
        )
      ),
      tap(() => {
        this.searchingItemNome = false;
      })
    );

  constructor(
    public modal: NgbActiveModal,
    private _itemService: ItemService
  ) {}
  ngAfterViewInit(): void {
    this.searchItem?.nativeElement.focus();
  }

  typeaHeadSelectItem(event: any): void {
    this.modal.close(event.item);
  }
}
