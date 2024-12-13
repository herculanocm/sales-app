import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-pdv-item-remove',
  templateUrl: './modal-pdv-item-remove.component.html',
  styleUrls: ['./modal-pdv-item-remove.component.scss'],
})
export class ModalPdvItemRemoveComponent implements AfterViewInit {

  
  @ViewChild('deleteItem')
  deleteItem: ElementRef | undefined;

  constructor(
    public modal: NgbActiveModal,
  ) {}
  ngAfterViewInit(): void {
    this.deleteItem?.nativeElement.focus();
  }
  sendValue(event: any): void {
    this.modal.close(event);
  }
}
