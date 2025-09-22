import {Component, Input} from '@angular/core';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {Card} from '../../../../../models/card';

@Component({
  selector: 'carrusel-ex',
  imports: [],
  templateUrl: './carrusel-ex.component.html',
  standalone: true
})
export class CarruselExComponent {
  constructor(private sanitizer: DomSanitizer) {
  }

  @Input() card!: Card;
  private _lastUrl?: string;
  private _lastSafe?: SafeStyle | null = null;

  get bgImage(): SafeStyle | null {
    const u = (this.card?.image || '').replace(/[\r\n]/g,'').trim().replace(/ /g, '%20');
    if (u !== this._lastUrl) {
      this._lastUrl = u;
      this._lastSafe = u ? this.sanitizer.bypassSecurityTrustStyle(`url("${u}")`) : null;
    }
    // @ts-ignore
    return this._lastSafe;
  }
}
