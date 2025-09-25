import { Component } from '@angular/core';
import {SharindDataService} from '../../../../services/sharind-data.service';
import {CommonModule} from '@angular/common';
import {Subscription} from 'rxjs';
import {FormsModule, NgForm} from '@angular/forms';
import {UserDtoPassword} from '../../../../models/user.dto.password';
import {RoleService} from '../../../../services/role.service';
import {Role} from '../../../../models/role';
import {PhonetypeService} from '../../../../services/phonetype.service';
import {PhoneTypeDto} from '../../../../models/phone.type';
import {PhonesReq} from '../../../../models/phones';
import {Router} from '@angular/router';
import {UserService} from '../../../../services/user.service';
import {Client} from '../../../../models/client';
import { RegisterService } from '../../../../services/register.service';

@Component({
  selector: 'auth-user-crud',
  imports: [CommonModule, FormsModule],
  templateUrl: './user-crud.component.html',
  standalone: true
})
export class UserCrudComponent {

  user: UserDtoPassword = new UserDtoPassword();
  roles: Role[] = [];
  phoneType: PhoneTypeDto[] = [];
  private sub?: Subscription;
  selectedRole!: string;

  constructor(private sharingData: SharindDataService,
              private roleService: RoleService,
              private userService: UserService,
              private phoneTypeService: PhonetypeService,
              private routes: Router,
              private resgisterService: RegisterService) {
  }  // <- nombre corregido

  ngOnInit() {
    this.sub = this.sharingData.user$.subscribe(u => {
      if (u?.id) {
        
        
        if(u.client?.phones != null){
          // 1) Normaliza los phones desde la respuesta del backend (lo que sea que venga)
          const normalizedRaw = this.normalizeIncomingPhones(u.client?.phones ?? []);
          // 2) Dedup por número+tipo
          const cleanPhones = this.dedupePhones(normalizedRaw);
          // 3) Fuerza a que el form tenga 2 entradas
          const phonesForForm = this.normalizePhones(cleanPhones);

          
          const clientP: Client = {
            ...(u.client as any),
            phones: phonesForForm,
          };

          this.user = { ...(u as any), client: clientP } as UserDtoPassword;
        }else{
          const clientP: Client = {
            ...(u.client as any),
            phones: this.emptyPhone()
          }
          this.user = {... (u as any), client:clientP} as UserDtoPassword;
        }

      } else {
        this.user = this.newEmptyUser();
      }
    });
    console.log(this.user)

    this.roleService.findAll()
      .subscribe(s => {
        this.roles = s;
      })

    this.phoneTypeService.findAll()
      .subscribe(s => {
        this.phoneType = s;
      })

    console.log(this.user)
  }




  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  clear() {
    this.user = this.newEmptyUser();
  }

  newEmptyUser(): UserDtoPassword {
    return {
      id: 0,
      client:{
        name: '',
        lastname: '',
        email: '',
        phones: [this.emptyPhone()]
      },
      username: '',
      password: '',
      roles: []
    } as unknown as UserDtoPassword;
  }

  onSubmit(userForm: NgForm,) {

    const validPhones = (this.user.client.phones ?? [])
      .map(p => ({ ...p, id:p.id, number: (p.number ?? '').trim() }))
      .filter(p => p.number.length > 0 && !!p.type?.code)
      .map(p => ({id:p.id, number: p.number, type: { code: p.type!.code } }));
    console.log(validPhones)

    // 📝 Asigna los roles de manera consistente
    this.user.roles = this.selectedRole === 'ROLE_ADMIN'
      ? ['ROLE_USER', 'ROLE_ADMIN']
      : ['ROLE_USER'];


    // 📝 Crea un objeto para el cuerpo de la petición (sin phones redundantes)
    const body = {
      ...this.user,
      phones: validPhones
    };

    if (this.user.id && this.user.id > 0) {
      // UPDATE directo desde el form
      this.userService.update(this.user.id, body).subscribe({
        next: () => {
          this.sharingData.setUser(null);
          this.routes.navigate(['/auth/usuarios']);
        },
        error: (e) => console.error('update error', e)
      });
    } else {
      // CREATE directo desde el form
      this.resgisterService.saveRegister(body).subscribe({
        next: () => {
          this.sharingData.setUser(null);
          this.routes.navigate(['/auth/usuarios']);
        },
        error: (e) => console.error('create error', e)
      });
    }

  }

  addPhone() {
    if (this.user.client.phones.length < 2) this.user.client.phones.push(this.emptyPhone());
  }

  removePhone(i: number) {
    this.user.client.phones.splice(i, 1);
    if (this.user.client.phones.length === 0) this.user.client.phones.push(this.emptyPhone());
  }

  byPhoneType = (a: PhoneTypeDto | null, b: PhoneTypeDto | null) =>
    !!a && !!b ? a.code === b.code : a === b;






  /** Deja solo dígitos, sin espacios ni guiones */
  private normalizePhone(n?: string): string {
    return (n ?? '').replace(/\D+/g, '').trim();
  }

  /** Acepta formatos mixtos y los convierte a PhonesReq uniforme */
  private normalizeIncomingPhones(arr: any[]): PhonesReq[] {
    const out: PhonesReq[] = [];
    for (const p of arr ?? []) {
      // puede venir como string ("50255551234"), como objeto con number/type string, o con type {code,name}
      const rawNumber = typeof p === 'string' ? p : (p?.number ?? '');
      const number = this.normalizePhone(rawNumber);
      // Type puede venir string ("WORK") o objeto {code:"WORK", name:"Trabajo"}
      const rawType = typeof p === 'string' ? null : (p?.type ?? null);
      const code =
        typeof rawType === 'string' ? rawType :
          (rawType?.code ?? null);

      out.push({
        id: typeof p === 'string' ? undefined : (p?.id ?? undefined),
        number,
      // @ts-ignore
        type: code ? { code } : null
      });
    }
    return out;
  }

  /** Elimina duplicados por (número + tipo.code). Si no hay tipo, dedup solo por número */
  private dedupePhones(arr: PhonesReq[]): PhonesReq[]{
      const map = new Map<string, PhonesReq>();
      for (const p of arr ?? []) {
        const num = this.normalizePhone(p?.number ?? '');
        if (!num) continue; // omite vacíos
        const code = p?.type?.code ?? '';
        const key = `${num}|${code}`;
        if (!map.has(key)) {
          // @ts-ignore
          map.set(key, { id: p?.id, number: num, type: code ? { code } : null });
        }
      }
      return [...map.values()];
  }

  /** Garantiza 2 filas para el form. Si falta tipo, deja null o pon un default si quieres. */
  private normalizePhones(phs?: PhonesReq[]): ({
    number: string;
    id: number | undefined;
    type: { code: string } | null
  } | PhonesReq)[] {
    const out = (phs ?? []).filter(Boolean).map(p => ({
      id: p.id,
      number: this.normalizePhone(p.number),
      type: p.type ? { code: p.type.code } : null
    }));

    // si quieres forzar un tipo por defecto cuando falte:
    // out.forEach(p => { if (!p.type) p.type = { code: 'WORK' }; });

    if (out.length === 0) return [this.emptyPhone(), this.emptyPhone()];
    if (out.length === 1) return [out[0], this.emptyPhone()];
    return out.slice(0, 2);
  }

  private emptyPhone(): PhonesReq {
    const type: PhoneTypeDto = {id: 0, name: '', code:''}
    return { id: undefined, number: '', type: type };  // o {code:'WORK'} si quieres default
  }

}
