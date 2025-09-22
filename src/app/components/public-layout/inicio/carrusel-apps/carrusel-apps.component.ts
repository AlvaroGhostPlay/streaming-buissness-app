import {Component, Input} from '@angular/core';
import {Card} from '../../../../models/card';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';

@Component({
  selector: 'carrusel-apps',
  imports: [],
  templateUrl: './carrusel-apps.component.html',
  standalone: true
})
export class CarruselAppsComponent {

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
