import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AuthNavBarComponent} from './nav-bar/nav-bar.component';
import {AuthFooterComponent} from './footer/footer.component';

@Component({
  selector: 'admins-layout',
  imports: [
    RouterOutlet,
    AuthNavBarComponent,
    AuthFooterComponent
  ],
  standalone: true,
  templateUrl: './admins-layout.component.html'
})
export class AdminsLayoutComponent {

}
