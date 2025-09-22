import {Component, ElementRef, HostListener, inject, NgZone, PLATFORM_ID, ViewChild} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ContenidoComponent} from './carrusel-apps/contenido/contenido.component';
import {HeroService} from '../../../services/hero.service';
import {interval, map, Subscription, timer} from 'rxjs';
import {Hero} from '../../../models/hero';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {isPlatformBrowser} from '@angular/common';
import {SeccionInicioComponent} from '../seccion/seccion.component';
import {ContenidoExComponent} from './contenido-ex/contenido-ex.component';

@Component({
  selector: 'inicio',
  imports: [RouterModule, ContenidoComponent, SeccionInicioComponent, ContenidoExComponent],
  standalone: true,
  templateUrl: './inicio.component.html'
})

export class InicioComponent {
  slides: Hero[] = [];
  current = 0;
  autoSub?: Subscription;
  private _lastUrl?: string;
  private _lastSafe?: SafeStyle | null = null;

  @ViewChild('hero', { static: false }) heroRef?: ElementRef<HTMLElement>;
  @ViewChild('fade', { static: false }) fadeRef?: ElementRef<HTMLElement>;

  isFading = false;
  pendingBg: SafeStyle | null = null;

  // ... tus props existentes ...
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Estado del gesto
  private pointerId?: number;
  private startX = 0;
  private startY = 0;
  private dx = 0;
  private dragging = false;
  private lock: 'h' | 'v' | null = null;

  // Umbrales
  private readonly ACTIVATION_PX = 8;    // movimiento mínimo para decidir
  private readonly SWIPE_THRESHOLD = 40; // para disparar prev/next
  private readonly H_BIAS = 1.3;         // preferencia horizontal (ángulo

  private mql?: MediaQueryList;
  private mqlHandler?: (e: MediaQueryListEvent) => void;
  isMobile = false;

  private readonly ROTATE_MS = 10000; // 10 segundos

  constructor(private heroService: HeroService,
              private sanitizer: DomSanitizer,
              private ngZone: NgZone) {}

  private toBg(url: string): SafeStyle | null {
    const u = (url || '').replace(/[\r\n]/g,'').trim().replace(/ /g, '%20');
    return u ? this.sanitizer.bypassSecurityTrustStyle(`url("${u}")`) : null;
  }

  private preload(url: string): Promise<void> {
    return new Promise(res => {
      if (!this.isBrowser || !url) { res(); return; }
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => this.ngZone.run(() => res());
      img.onerror = () => this.ngZone.run(() => res());
      img.src = url;
    });
  }

  ngOnInit(): void {
    // 2.1 Breakpoint
    if (this.isBrowser) {
      this.mql = window.matchMedia('(max-width: 767px)');
      this.isMobile = this.mql.matches;
      this.mqlHandler = (e) => this.ngZone.run(() => {
        this.isMobile = e.matches;
        // fuerza recomputar el bg si cambia el breakpoint
        this._lastUrl = undefined;
      });
      // compat Safari viejito
      (this.mql.addEventListener?.bind(this.mql) ?? this.mql.addListener)( 'change' as any, this.mqlHandler as any );
    }

    // 2.2 Carga de slides (mapea también la versión móvil si existe)
    this.heroService.findAll()
      .pipe(
        map(rows => (rows ?? []).map((r: any) => ({
          id: r.id,
          title: r.title,
          subtitle: r.subtitle ?? '',
          description: r.description ?? r.subtitle ?? '',
          imageUrl: r.imageKey ?? r.image_url ?? '',
          // intenta varias claves comunes; ajusta a tu API
          imageUrlMobile: r.imageUrlMobile ?? r.image_url_mobile ?? r.imageMobile ?? r.image_url_sm ?? '',
          ctaUrl: r.ctaUrl ?? r.cta_url ?? ''
        } as Hero)))
      )
      .subscribe({
        next: s => {
          this.slides = s.filter(h => !!h.imageUrl || !!h.imageUrlMobile);
          this.current = 0;
          if (this.slides.length > 1) this.restartAutoRotate( this.ROTATE_MS ); // inicia
          else this.stopAutoRotate();
        },
        error: e => console.error(e)
      });
  }

  ngOnDestroy(): void {
    this.autoSub?.unsubscribe();
    if (this.mql && this.mqlHandler) {
      (this.mql.removeEventListener?.bind(this.mql) ?? this.mql.removeListener)('change' as any, this.mqlHandler as any);
    }
  }

  private selectUrl(slide?: Hero): string {
    if (!slide) return '';
    const url = this.isMobile ? (slide.imageUrlMobile || slide.imageUrl) : slide.imageUrl;
    return (url || '').trim();
  }

  get currentSlide(): Hero | undefined {
    return this.slides[this.current];
  }

  async next() {
    if (!this.slides.length || this.isFading) return;
    const idx = (this.current + 1) % this.slides.length;
    await this.goTo(idx);
    this.restartAutoRotate(); // resetea conteo
  }

  async prev() {
    if (!this.slides.length || this.isFading) return;
    const idx = (this.current - 1 + this.slides.length) % this.slides.length;
    await this.goTo(idx);
    this.restartAutoRotate(); // resetea conteo
  }


  private async goTo(idx: number){
    const url = this.selectUrl(this.slides[idx]);
    await this.preload(url);
    this.pendingBg = this.toBg(url);
    if (!this.isBrowser) { this.current = idx; this.pendingBg = null; return; }

    const fadeEl = this.fadeRef?.nativeElement;
    if (fadeEl){
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        fadeEl.removeEventListener('transitionend', finish);
        this.current = idx;
        this.isFading = false;
        this.pendingBg = null;
      };
      fadeEl.addEventListener('transitionend', finish, { once: true });
      setTimeout(finish, 500);
      // fuerza reflow
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      fadeEl.offsetHeight;
    }
    this.isFading = true;
  }

  // 👇 ahora el getter usa selectUrl()
  get bgImage(): SafeStyle | null {
    const u = this.selectUrl(this.currentSlide);
    if (u !== this._lastUrl) {
      this._lastUrl = u;
      this._lastSafe = this.toBg(u);
    }
    // @ts-ignore
    return this._lastSafe;
  }

  get bgImageTitle(): SafeStyle | null {
    const u = (this.currentSlide?.title || '').replace(/[\r\n]/g,'').trim().replace(/ /g, '%20');
    if (u !== this._lastUrl) {
      this._lastUrl = u;
      this._lastSafe = u ? this.sanitizer.bypassSecurityTrustStyle(`url("${u}")`) : null;
    }
    // @ts-ignore
    return this._lastSafe;
  }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft') { this.prev(); this.restartAutoRotate(); }
    if (e.key === 'ArrowRight'){ this.next(); this.restartAutoRotate(); }
  }


  onHeroPointerDown(e: PointerEvent) {
    if (!this.isBrowser) return;

    const target = e.target as Element | null;
    if (target && target.closest('button, a, input, textarea, select, [role="button"], [data-no-drag]')) {
      return; // ← deja que el botón maneje el click normal
    }

    if (e.button !== 0 && e.pointerType === 'mouse') return; // sólo click izq en mouse
    this.pointerId = e.pointerId;
    //his.heroRef?.nativeElement.setPointerCapture?.(e.pointerId);
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.dx = 0;
    this.dragging = true;
    this.lock = null;
  }

  onHeroPointerMove(e: PointerEvent) {
    if (!this.isBrowser || !this.dragging || e.pointerId !== this.pointerId) return;

    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;

    // Decide orientación del gesto una vez
    if (this.lock == null && (Math.abs(dx) > this.ACTIVATION_PX || Math.abs(dy) > this.ACTIVATION_PX)) {
      this.lock = Math.abs(dx) >= Math.abs(dy) * this.H_BIAS ? 'h' : 'v';
      // si se bloquea horizontal, evitamos que el navegador haga scroll horizontal "fantasma"
      if (this.lock === 'h') e.preventDefault();
    }

    if (this.lock === 'h') {
      this.heroRef?.nativeElement.setPointerCapture?.(this.pointerId!);
      this.dx = dx; // opcional: podrías animar un “drag” visual con translateX
      e.preventDefault();
    } else if (this.lock === 'v') {
      // dejamos pasar el scroll vertical y abandonamos el gesto
      this.cancelGesture(e);
    }
  }

  onHeroPointerUp(e: PointerEvent) {
    if (!this.isBrowser || e.pointerId !== this.pointerId) return;
    try {
      if (this.lock === 'h') {
        if (Math.abs(this.dx) > this.SWIPE_THRESHOLD) {
          if (this.dx < 0) this.next(); else this.prev();
        }
        e.preventDefault();
      }
    } finally {
      this.cancelGesture(e);
    }
  }

  onHeroPointerCancel(e: PointerEvent) {
    this.cancelGesture(e);
  }

  private cancelGesture(e?: PointerEvent) {
    if (this.pointerId != null) {
      this.heroRef?.nativeElement.releasePointerCapture?.(this.pointerId);
    }
    this.pointerId = undefined;
    this.dragging = false;
    this.lock = null;
    this.dx = 0;
  }

  // --- (Opcional) trackpad/rueda para cambiar de slide horizontalmente ---
  onHeroWheel(e: WheelEvent) {
    if (!this.isBrowser) return;
    // si el gesto es más horizontal que vertical y supera umbral…
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 20) {
      e.preventDefault();
      if (e.deltaX > 0) this.next(); else this.prev();
    }
  }

  startAutoRotate(): void {
    if (!this.isBrowser || this.slides.length <= 1) return;
    this.autoSub?.unsubscribe();
    // empieza ya y repite cada ROTATE_MS
    this.autoSub = interval(this.ROTATE_MS).subscribe(() =>
      this.ngZone.run(() => this.next())
    );
  }

  stopAutoRotate(): void {
    this.autoSub?.unsubscribe();
    this.autoSub = undefined;
  }

  restartAutoRotate(delay = this.ROTATE_MS): void {
    if (!this.isBrowser || this.slides.length <= 1) return;
    this.stopAutoRotate();
    // primera ejecución después de 'delay', luego cada ROTATE_MS
    this.autoSub = timer(delay, this.ROTATE_MS).subscribe(() =>
      this.ngZone.run(() => this.next())
    );
  }
}
