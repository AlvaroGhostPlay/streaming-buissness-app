import { Routes } from '@angular/router';
import {AuthUserComponent} from './components/admins-layout/user/user.component';
import {AuthClientComponent} from './components/admins-layout/client/client.component';
import {AuthProductComponent} from './components/admins-layout/product/product.component';
import {InicioComponent} from './components/public-layout/inicio/inicio.component';
import {ContactoComponent} from './components/public-layout/contacto/contacto.component';
import {NosotrosComponent} from './components/public-layout/nosotros/nosotros.component';
import {LoginComponent} from './components/public-layout/login/login.component';
import { isAdminMatch, isPublic} from './guards/auth.guard';
import {PublicLayoutComponent} from './components/public-layout/public-layout.component';
import {AdminsLayoutComponent} from './components/admins-layout/admins-layout.component';
import {AuthInicioComponent} from './components/admins-layout/inicio/inicio.component';
import {AuthProductCrudComponent} from './components/admins-layout/product/product-crud/product-crud.component';
import {UserCrudComponent} from './components/admins-layout/user/user-crud/user-crud.component';
import { ChangePasswordComponent } from './components/public-layout/change-password/change-password.component';
import { RegistrarseComponent } from './components/public-layout/registrarse/registrarse.component';
import { ForgetPasswordComponent } from './components/public-layout/forget-password/forget-password.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },

  // privado para los admins
  {
    path: 'auth',
    component: AdminsLayoutComponent,
    data: {
      theme: 'light'
    },
    children: [
      //{ path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'inicio', component: AuthInicioComponent },
      { path: 'productos', component: AuthProductComponent },
      { path: 'usuarios', component: AuthUserComponent },
      { path: 'usuarios/page/:page', component: AuthUserComponent },
      { path: 'usuarios/edit', component: UserCrudComponent },
      { path: 'usuarios/create', component: UserCrudComponent },
      { path: 'clientes', component: AuthClientComponent },
      { path: 'productos/edit', component: UserCrudComponent },
    ],
    canMatch: [isAdminMatch]
  },

  // Público envuelto por el layout que pinta nav-bar y app-footer
  {
    path: '',
    component: PublicLayoutComponent,
    data: {
      theme: 'dark'
    },
    children: [
      { path: 'inicio', component: InicioComponent },
      { path: 'contacto', component: ContactoComponent },
      { path: 'sobre_nosotros', component: NosotrosComponent },
      { path: 'login', component: LoginComponent },
      { path: 'newPass', component: ChangePasswordComponent },
      { path: 'registrarse', component: RegistrarseComponent },
      { path: 'forget-password', component: ForgetPasswordComponent },
    ],
    canMatch: [isPublic]
  },
];
