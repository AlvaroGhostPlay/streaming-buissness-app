import {Component, inject} from '@angular/core';
import { UserService } from '../../../services/user.service';
import { UserDto } from '../../../models/user.dto';
import {map, Subscription} from 'rxjs';
import {ActivatedRoute, Router,} from '@angular/router';
import {SharindDataService} from '../../../services/sharind-data.service';
import {PaginatorComponent} from '../paginator/paginator.component';


@Component({
  selector: 'auth-user',
  standalone: true,
  imports: [PaginatorComponent],
  templateUrl: './user.component.html',
})
export class AuthUserComponent {
  users: UserDto[] = [];
  sub = new Subscription();  // compuesta
  paginator: any = {};
  url: string = '/auth/usuarios/page';

  constructor(private userService: UserService,
              private sharingData: SharindDataService,
              private routes: Router,
              private route: ActivatedRoute,
  ){}

  ngOnInit() {
    if (this.users == undefined || this.users.length == 0 || this.users == null) {
      this.route.params.subscribe(params => {
        const page = +(params['page'] || 0);
        this.userService.findAllPageable(page)
          .pipe(
            map(pg => ({
              ...pg,
              content: (pg.content ?? []).map((u: UserDto) => this.normalizeUser(u))
            }))
          )
          .subscribe(pg => {
            console.log(pg.content);
            this.users = pg.content ?? [];
            this.paginator = pg;
          });
      });
    }

    // Eliminar
    this.sub.add(
      this.sharingData.handlerUserDeleteEventEmitter.subscribe(({id}) => {
        this.userService.remove(id).subscribe(() => {
          this.users = this.users.filter(u => u.id !== id);
        });
      })
    );
  }


  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  onAdd() {
    const user = undefined
    this.sharingData.setUser(user);
    this.routes.navigate(['/auth/usuarios/create']);
  }

  onEdit = (user: UserDto) => {
    console.log(user.id)
    this.sharingData.setUser(user);
    this.routes.navigate(['/auth/usuarios/edit']);
  };

  onDelete(user: UserDto) {
    this.userService.remove(user.id).subscribe(() => {
      this.users.filter(h => !!h.id);
      this.routes.navigate(['/auth/usuarios/create']);
      this.routes.navigate(['/auth/usuarios']);
    });

  }


  private normalizePhone(n?: string): string {
    return (n ?? '').replace(/\D+/g, '').trim();
  }
  private typeCode(t: any): string {
    return typeof t === 'string' ? t : (t?.code ?? '');
  }
  private dedupePhones(arr: any[]): any[] {
    const m = new Map<string, any>();
    for (const p of arr ?? []) {
      const num = this.normalizePhone(p?.number ?? '');
      const code = this.typeCode(p?.type);
      const key = `${num}|${code}`;
      if (!m.has(key)) {
        m.set(key, {
          id: p.id ?? null,
          number: num,
          type: typeof p.type === 'string' ? { code: p.type } : (p.type ?? null)
        });
      } else {
        // si el duplicado trae id y el guardado no, conserva el que tiene id
        const saved = m.get(key);
        if (!saved.id && p.id) m.set(key, { ...saved, id: p.id });
      }
    }
    return [...m.values()];
  }

  private normalizeUser(r: any) :UserDto {
    console.log(r)
    return {
      id: r.id,
      client: r.client,
      username: r.username,
    // @ts-ignore
     roles: Array.from(new Set((r.roles ?? []).map((x: any) => typeof x === 'string' ? x : (x?.name ?? '')))).filter(Boolean),
     // phones: this.dedupePhones(r.phones ?? [])
    };
  }
}
