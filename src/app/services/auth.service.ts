import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {isPlatformBrowser} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url: string = 'http://localhost:8080/login';

  private _token: string | undefined;
  private _user: any = {
    isAuth: false,
    isAdmin: false,
    user: undefined
  }

  constructor(private http: HttpClient,
              @Inject(PLATFORM_ID) private platformId: Object) { }

  loginUser({username, password}: any):Observable<any>{
    console.log(username, password);
    return this.http.post<any>(this.url, {username, password});
  }

  set user(user: any) {
    this._user = user;
    if (this.isBrowser) {
      try { sessionStorage.setItem('login', JSON.stringify(user)); } catch {}
    }
  }

  get user(): any {
    if (this._user?.isAuth) return this._user;
    if (!this.isBrowser) return this._user;               // ⬅️ en SSR no tocar storage
    try {
      const raw = sessionStorage.getItem('login');
      if (raw) this._user = JSON.parse(raw);
    } catch {}
    return this._user;
  }

  set token(token: string) {
    this._token = token;
    sessionStorage.setItem('token', token);
  }

  get token(): string | undefined {
    if (this._token) return this._token;
    if (!this.isBrowser) return undefined;                // ⬅️ en SSR no tocar storage
    try {
      const t = sessionStorage.getItem('token');
      if (t) this._token = t;
    } catch {}
    return this._token;
  }

  payload(token:string){
    if (token != null) {
      return JSON.parse(atob(token.split(".")[1]));
    }
    return null;
  }

  isAdmin(){
    return this.user.isAdmin;
  }

  authenticated()
  {
    return this.user.isAuth;
  }


  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  logout() {
    this._token = undefined;
    this._user = { isAuth: false, isAdmin: false, user: undefined };
    if (this.isBrowser) {
      try {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('login');
      } catch {}
    }
  }
}
