import { Component } from '@angular/core';
import {ContenidoComponent} from './contenido/contenido.component';
import {HeroService} from '../../../services/hero.service';
import {Nosotros} from '../../../models/nosotros';

@Component({
  selector: 'nosotros',
  imports: [ContenidoComponent],
  templateUrl: './nosotros.component.html',
  standalone: true
})
export class NosotrosComponent {

  nosotros: Nosotros[] = [];

  constructor(
    private herService: HeroService,
  ) {}

  ngOnInit() {
    // @ts-ignore
    this.herService.findAllNostros(1)
    .subscribe({
      next: s => {
        this.nosotros = s;
        console.log(this.nosotros);
      }
    })
  }
}
