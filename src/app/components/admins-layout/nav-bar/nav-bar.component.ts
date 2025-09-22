import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'auth-nav-bar',
  imports: [
    RouterLink
  ],
  standalone: true,
  templateUrl: './nav-bar.component.html'
})
export class AuthNavBarComponent {
  drawerOpen = false;

  toggleDrawer() {
    this.drawerOpen = !this.drawerOpen;
  }
  closeDrawer()  {
    this.drawerOpen = false;
  }
}
