import {Component, Input} from '@angular/core';
import {Nosotros} from '../../../../models/nosotros';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';

@Component({
  selector: 'nosotros-contenido',
  imports: [],
  standalone: true,
  templateUrl: './contenido.component.html'
})
export class ContenidoComponent {

  @Input() nosotro!: Nosotros;
  private _lastUrl?: string;
  private _lastSafe?: SafeStyle | null = null;

  constructor(private sanitizer: DomSanitizer) {
  }

  get bgImage(): SafeStyle | null {
    const u = (this.nosotro?.imageUrl || '').replace(/[\r\n]/g,'').trim().replace(/ /g, '%20');
    if (u !== this._lastUrl) {
      this._lastUrl = u;
      this._lastSafe = u ? this.sanitizer.bypassSecurityTrustStyle(`url("${u}")`) : null;
    }
    // @ts-ignore
    return this._lastSafe;
  }
}
