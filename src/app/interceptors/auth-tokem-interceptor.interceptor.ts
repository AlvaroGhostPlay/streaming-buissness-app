import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {inject, PLATFORM_ID} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';
import {isPlatformBrowser} from '@angular/common';
import {catchError, throwError} from 'rxjs';


export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const pid   = inject(PLATFORM_ID);
  const auth  = inject(AuthService);
  const router = inject(Router);

  // No adjuntes token en SSR ni en el login
  if (!isPlatformBrowser(pid) || req.url.endsWith('/login')) {
    return next(req);
  }

  const token = auth.token; // tu getter ya es SSR-safe
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        // opcional: limpia sesión y manda a login
        auth.logout?.(); // si implementas logout(); abajo dejo ejemplo
        router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => err);
    })
  );
};
