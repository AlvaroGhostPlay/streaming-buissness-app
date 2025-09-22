import {Component, HostListener} from '@angular/core';
import { RouterModule } from '@angular/router';
import {Router} from 'express';
import {Hero} from '../../../models/hero';
import {interval, Subscription} from 'rxjs';
import {HeroService} from '../../../services/hero.service';

@Component({
  selector: 'nav-bar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './nav-bar.component.html'
})
export class NavBarComponent {
  drawerOpen = false;

  toggleDrawer() {
    this.drawerOpen = !this.drawerOpen;
  }
  closeDrawer()  {
    this.drawerOpen = false;
  }


}
