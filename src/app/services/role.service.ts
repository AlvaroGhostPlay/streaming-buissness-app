import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Role} from '../models/role';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private url: string = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  // @ts-ignore
  findAll(): Observable<Role[]>{
    return this.http.get<Role[]>(this.url+"/roles");
  }
}
