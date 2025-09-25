import {Component, Inject, PLATFORM_ID, Renderer2} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {SharindDataService} from './services/sharind-data.service';
import {AuthService} from './services/auth.service';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {filter} from 'rxjs';
import { log } from 'console';
import { ModalComponent } from './components/modal/modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ModalComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'streaming-buissness-app';

  isModalVisible = false;
  backendMessage = '';
  validation!: number;

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
      const username2 = username;
      console.log(username2)
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

                  this.validation = 200
                  this.backendMessage = 'Has iniciado sesion con éxito!';
                  this.isModalVisible = true;
            //const tree = this.router.parseUrl(this.router.url);
            //const returnUrl = (tree.queryParams && (tree.queryParams as any)['returnUrl']) || '/auth/inicio';
            // Navega ABSOLUTO
            //this.router.navigateByUrl(returnUrl);
        },
        error: error => {
          console.log(error.status)
          if (error.status == 401){
                this.validation = error.status;
                this.backendMessage = 'Error en la autenticación con username o password incorrectos!';
                this.isModalVisible = true;
            } else if(error.status==428){
            this.sharinData.setUsername(username2); // guarda el valor
            this.validation = error.status;
                this.backendMessage = 'Usuario necesita cambio de contraseña';
                this.isModalVisible = true;
          }else if(error.status == 403){
            this.validation = error.status;
                this.backendMessage = 'Error La contraseña ha vencido, solicita una nueva contraseña en la opcion "¿Olvidaste tu contraseña?"';
                this.isModalVisible = true;
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

  onModalClosed() {
    this.isModalVisible = false;
    const isAdmin = this.authService.isAdmin();
    if (this.validation === 200 && isAdmin == true){
      console.log('soy admin')
      this.router.navigate(['/auth/inicio']); // 🚀 ahora navega aquí
    }

    if (this.validation === 428){
      this.router.navigate(['/newPass']); // 🚀 ahora navega aquí
    }
  }

}
