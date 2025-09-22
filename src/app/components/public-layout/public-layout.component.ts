import { Component } from '@angular/core';
import {FooterComponent} from './footer/footer.component';
import {NavBarComponent} from './nav-bar/nav-bar.component';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-public-layout',
  imports: [
    FooterComponent,
    NavBarComponent,
    RouterOutlet
  ],
  templateUrl: './public-layout.component.html',
  standalone: true
})
export class PublicLayoutComponent {

}
