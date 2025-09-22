import {CanActivateFn, CanMatchFn, UrlSegment, UrlTree} from '@angular/router';
import {inject, PLATFORM_ID} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {isPlatformBrowser} from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  return false;
};

export const isPublic: CanMatchFn = (_route, segments: UrlSegment[]) => {
  const router = inject(Router);
  const auth   = inject(AuthService);
  const pid    = inject(PLATFORM_ID);

  // En SSR: no decides nada (evita parpadeos)
  if (!isPlatformBrowser(pid)) return true;

  // Si la URL objetivo ya es /auth/... no intervengas (evita loop)
  const first = segments[0]?.path ?? '';
  if (first === 'auth') return true;

  // Solo en rutas públicas, redirige a dashboard si ya es admin
  return (auth.authenticated() && auth.isAdmin())
    ? router.createUrlTree(['/auth', 'inicio'])
    : true;
};

export const isAdminMatch: CanMatchFn = (_route, _segments): boolean | UrlTree => {
  const router = inject(Router);
  const auth   = inject(AuthService);
  const pid    = inject(PLATFORM_ID);

  // SSR: no bloquees, deja que el cliente decida
  if (!isPlatformBrowser(pid)) return true;

  if (auth.authenticated() && auth.isAdmin()) return true;

  // opcional: returnUrl para volver luego
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: router.url } });
};


