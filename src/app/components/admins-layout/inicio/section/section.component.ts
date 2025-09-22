import {Component, Input} from '@angular/core';
import {Section} from '../../../../models/section';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';

@Component({
  selector: 'auth-section-1',
  imports: [],
  templateUrl: './section.component.html',
  standalone: true,
})
export class SectionComponent {

  @Input() seccion!: Section;
  private _lastUrl?: string;
  private _lastSafe?: SafeStyle | null = null;

  constructor(private sanitizer: DomSanitizer) {
  }

  get bgImage(): SafeStyle | null {
    const u = (this.seccion?.imageUrl || '').replace(/[\r\n]/g,'').trim().replace(/ /g, '%20');
    if (u !== this._lastUrl) {
      this._lastUrl = u;
      this._lastSafe = u ? this.sanitizer.bypassSecurityTrustStyle(`url("${u}")`) : null;
    }
    console.log(this._lastSafe)
    // @ts-ignore
    return this._lastSafe;
  }
}
