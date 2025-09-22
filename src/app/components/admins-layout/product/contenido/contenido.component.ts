import {Component, Input} from '@angular/core';
import {Card} from '../../../../models/card';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'contenido',
  imports: [
    RouterLink
  ],
  templateUrl: './contenido.component.html',
  standalone: true
})
export class ContenidoComponent {

  @Input() card!: Card;

  private _lastUrl?: string;
  private _lastSafe?: SafeStyle | null = null;

  constructor(
    private sanitizer: DomSanitizer) {
  }

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
