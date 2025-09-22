import {Component, Input} from '@angular/core';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'auth-paginator',
  imports: [RouterModule],
  templateUrl: './paginator.component.html',
  standalone: true,
})
export class PaginatorComponent {

  @Input() url: string = '';
  @Input() paginator: any = {}

}
