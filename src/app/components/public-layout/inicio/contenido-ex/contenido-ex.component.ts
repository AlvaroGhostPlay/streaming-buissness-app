import {ChangeDetectorRef, Component, ElementRef, inject, NgZone, PLATFORM_ID, ViewChild} from '@angular/core';
import {CarruselExComponent} from './carrusel-ex/carrusel-ex.component';
import {Card} from '../../../../models/card';
import {isPlatformBrowser} from '@angular/common';
import {HeroService} from '../../../../services/hero.service';
import {map} from 'rxjs';
import {CarruselAppsComponent} from '../carrusel-apps/carrusel-apps.component';

@Component({
  selector: 'contenido-ex',
  imports: [CarruselExComponent],
  templateUrl: './contenido-ex.component.html',
  standalone: true,
})
export class ContenidoExComponent {
  @ViewChild('row', { static: true }) row!: ElementRef<HTMLDivElement>;
  cards: Card[] = [];
  canPrev = false;
  canNext = false;

  private ro?: ResizeObserver;
  private mo?: MutationObserver;
  private io?: IntersectionObserver;
  private firstEl?: Element;
  private lastEl?: Element;
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor(
    private heroService: HeroService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}


  private raf(cb: (ts: number) => void) {
    if (this.isBrowser && typeof requestAnimationFrame !== 'undefined') {
      return requestAnimationFrame(cb);
    }
    // Fallback en SSR
    return setTimeout(() => cb(Date.now()), 0) as unknown as number;
  }

  ngOnInit() {
    this.heroService.findAllPlataforms()
      .pipe(map(rows => (rows ?? []).map((r: any) => ({
        id: r.id, product: r.product, image: r.image
      } as Card))))
      .subscribe({
        next: s => {
          this.cards = s.filter(h => !!h.image);
          this.raf(() => this.ngZone.run(() => {
            if (!this.isBrowser) return;      // <- evita medir en SSR
            this.attachIO();
            this.recomputeArrows();
            this.cdr.markForCheck();
          }));
        },
        error: e => console.error(e)
      });
  }

  ngAfterViewInit(): void {

    if (!this.isBrowser) {
      // En SSR no hay APIs del DOM reales; no medimos nada aquí.
      return;
    }
    const el = this.row.nativeElement;

    // ResizeObserver (solo si existe)
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => {
        this.ngZone.run(() => {
          this.recomputeArrows();
          this.cdr.markForCheck();
        });
      });
      this.ro.observe(el);
    }

    // MutationObserver (solo si existe)
    if (typeof MutationObserver !== 'undefined') {
      this.mo = new MutationObserver(() => {
        this.ngZone.run(() => {
          this.attachIO();
          this.recomputeArrows();
        });
      });
      this.mo.observe(el, { childList: true, subtree: false });
    }

    // Inicial
    this.attachIO();
    this.recomputeArrows();
  }

  ngOnDestroy(){
    this.ro?.disconnect();
    this.mo?.disconnect();
    this.io?.disconnect();
  }

  onRowsScroll() {
    // IO ya actualiza, pero mantenemos un fallback robusto
    this.ngZone.run(() => this.recomputeArrows());
  }

  scrollRow(dir: 'next' | 'prev') {
    const el = this.row.nativeElement;
    const step = Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: dir === 'next' ? step : -step, behavior: 'smooth' });
    // re-evaluar tras el scroll suave
    setTimeout(() => this.recomputeArrows(), 300);
  }

  private attachIO() {
    if (!this.isBrowser || typeof IntersectionObserver === 'undefined') {
      // Sin IO, dependemos del fallback de recomputeArrows() y del (scroll)
      return;
    }
    const root = this.row.nativeElement;
    this.io?.disconnect();

    const first = root.firstElementChild;
    const last  = root.lastElementChild;

    if (!first || !last) { this.canPrev = this.canNext = false; return; }

    this.firstEl = first;
    this.lastEl  = last;

    this.io = new IntersectionObserver((entries) => {
      this.ngZone.run(() => {
        for (const e of entries) {
          if (e.target === this.firstEl) this.canPrev = e.intersectionRatio < 1;
          if (e.target === this.lastEl)  this.canNext = e.intersectionRatio < 1;
        }
        this.cdr.markForCheck();
      });
    }, { root: root, threshold: 1.0 });

    this.io.observe(first);
    this.io.observe(last);
  }

  private recomputeArrows() {
    // Fallback por subpíxeles/redondeos
    const el = this.row.nativeElement;
    const first = el.firstElementChild as HTMLElement | null;
    const last  = el.lastElementChild  as HTMLElement | null;
    if (!first || !last) { this.canPrev = this.canNext = false; return; }

    const cr = el.getBoundingClientRect();
    const fr = first.getBoundingClientRect();
    const lr = last.getBoundingClientRect();

    this.canPrev = fr.left < cr.left - 0.5 || el.scrollLeft > 0;
    this.canNext = lr.right > cr.right + 0.5 ||
      (el.scrollLeft + el.clientWidth) < el.scrollWidth - 1;
  }

}
