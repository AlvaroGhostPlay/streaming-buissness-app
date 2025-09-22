import {Component, Inject, PLATFORM_ID, Renderer2} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {SharindDataService} from './services/sharind-data.service';
import {AuthService} from './services/auth.service';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {filter} from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'streaming-buissness-app';

  constructor(private sharinData: SharindDataService,
              private authService: AuthService,
              private router:Router,
              private renderer: Renderer2,
              private route: ActivatedRoute,
              @Inject(DOCUMENT) private doc: Document,
              @Inject(PLATFORM_ID) private platformId: Object) {
    if (!isPlatformBrowser(this.platformId)) return;

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        const theme = this.getCurrentTheme() || 'light';
        this.applyBodyTheme(theme);
      });
  }

  ngOnInit() {
    this.handlerLogin();
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => {
        const theme = this.getCurrentTheme() || 'light';
        console.log('[THEME]', theme, 'URL=', (e as NavigationEnd).urlAfterRedirects);
        this.applyBodyTheme(theme);
      });
  }

  handlerLogin(): void {
    this.sharinData.handlerLoginEventEmitter.subscribe(({username, password}) => {
      this.authService.loginUser({username, password}).subscribe({
        next: response => {
          const token = response.token;
          const payload = this.authService.payload(token);
          const user = {username: payload.sub};
          const login ={
            user,
            isAuth: true,
            isAdmin: payload.isAdmin
          }

          this.authService.user= login;
          this.authService.token = token;
          const tree = this.router.parseUrl(this.router.url);
          const returnUrl = (tree.queryParams && (tree.queryParams as any)['returnUrl']) || '/auth/inicio';
          // Navega ABSOLUTO
          this.router.navigateByUrl(returnUrl);
        },
        error: error => {
          if (error.estatus == 401){
            console.log(error);
          } else {
            throw error;
          }
        }
      });
    })
  }

  private getCurrentTheme(): string | undefined {
    let theme: string | undefined;
    let r = this.router.routerState.snapshot.root; // <- usa el snapshot del router
    while (r) {
      const t = r.data?.['theme'];
      if (t) theme = t;        // guarda el último encontrado (padre o hijo)
      r = r.firstChild!;
    }
    return theme;
  }

  private applyBodyTheme(theme: string) {
    const body = this.doc.body;
    this.renderer.removeClass(body, 'theme-light');
    this.renderer.removeClass(body, 'theme-dark');
    this.renderer.addClass(body, `theme-${theme}`);
  }

}
