import {Component} from '@angular/core';
import {HeroService} from '../../../services/hero.service';
import {Card} from '../../../models/card';
import {map} from 'rxjs';
import {ContenidoComponent} from './contenido/contenido.component';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [ContenidoComponent],
  templateUrl: './product.component.html'
})
export class AuthProductComponent {
  constructor(
    private heroService: HeroService,
    ){}
  cards: Card[] = [];

  ngOnInit() {
    this.heroService.findAllPlataforms().pipe(
      map(rows => (rows ?? []).map((r: any) => ({
        id: r.id,
        product: r.product,
        image: r.image
      })))
    ).subscribe({
      next: s => {
        this.cards = s.filter(h => !!h.image);
      },
      error: e => console.error(e)
    })
  }



}
