import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'auth-footer',
  imports: [
    RouterLink
  ],
  templateUrl: './footer.component.html',
  standalone: true
})
export class AuthFooterComponent {

}
