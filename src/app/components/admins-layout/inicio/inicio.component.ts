import { Component } from '@angular/core';
import {HeroService} from '../../../services/hero.service';
import {Section} from '../../../models/section';
import {map} from 'rxjs';
import {Hero} from '../../../models/hero';
import {SectionComponent} from './section/section.component';

@Component({
  selector: 'auth-inicio',
  imports: [
    SectionComponent
  ],
  templateUrl: './inicio.component.html',
  standalone: true
})
export class AuthInicioComponent {
  bienvenida: boolean = false;
  sections: Section[] = [];

  constructor(private heroService: HeroService,) {
  }

  ngOnInit() {
    this.bienvenida = true;
    this.heroService.findAllSectionInicioAuth(2)
      .pipe(
        map(rows => (rows ?? []).map((r: any) => ({
          id: r.id,
          imageUrl: r.imageKey ?? r.image_url ?? r.imageUrl?? '',
        } as Section)))
      )
      .subscribe({
        next: s => {
          this.sections = (s ?? []).filter(h => !!h.imageUrl);
        },
        error: e => console.error(e)
      });
  }
}
