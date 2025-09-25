import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'modal',
  imports: [],
  templateUrl: './modal.component.html',
  standalone: true
})
export class ModalComponent {
  @Input() title: string = 'Mensaje';
  @Input() message: string = '';
  @Input() show: boolean = false;

  @Output() closed = new EventEmitter<void>();

  constructor(){}

  ngOnInit(){
    console.log('entro al modal')
  }

  closeModal() {
    this.show = false;
    this.closed.emit();
  }
}
