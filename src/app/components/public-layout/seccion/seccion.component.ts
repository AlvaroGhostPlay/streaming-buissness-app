import { Component } from '@angular/core';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {get} from 'node:http';
import {Hero} from '../../../models/hero';
import {HeroService} from '../../../services/hero.service';
import {map, pipe} from 'rxjs';
import {Section} from '../../../models/section';

@Component({
  selector: 'seccion-inicio',
  imports: [],
  templateUrl: './seccion.component.html',
  standalone: true
})
export class SeccionInicioComponent {
  private _lastUrl?: string;
  private _lastSafe?: SafeStyle | null = null;
  isMobile = false;

  section!: Section;

  constructor(
    private sanitizer: DomSanitizer,
    private heroservice: HeroService) {
  }

  ngOnInit() {
  this.heroservice.findAllSectionInicio(1)
      .subscribe({
        next: s => {
          this.section = s;
        },
        error: e => console.error(e)
      });
  }

  get currentSlide(): Section | undefined {
    return this.section;
  }

  get bgImage(): SafeStyle | null {
    const u = this.selectUrl(this.currentSlide);
    if (u !== this._lastUrl) {
      this._lastUrl = u;
      this._lastSafe = this.toBg(u);
    }
    // @ts-ignore
    return this._lastSafe;
  }

  private toBg(url: string): SafeStyle | null {
    const u = (url || '').replace(/[\r\n]/g,'').trim().replace(/ /g, '%20');
    return u ? this.sanitizer.bypassSecurityTrustStyle(`url("${u}")`) : null;
  }

  private selectUrl(slide?: Section): string {
    if (!slide) return '';
    const url = this.isMobile ? (slide.imageUrl) : slide.imageUrl;
    return (url || '').trim();
  }
}
