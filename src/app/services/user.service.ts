import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDto } from '../models/user.dto';
import { HttpClient } from '@angular/common/http';
import {UserDtoPassword} from '../models/user.dto.password';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private url: string = 'http://localhost:8080';

  constructor(private http:HttpClient) { }

  findAll() :Observable<UserDto[]>{
    return  this.http.get<UserDto[]>(this.url+"/users");
  }

  // 📝 No es necesario reprocesar los datos, ya vienen listos desde el componente.
  save(u: any) :Observable<UserDtoPassword>{
    return this.http.post<UserDtoPassword>(this.url + "/user", u);
  }

  remove(id:number): Observable<void>{
    // @ts-ignore
    return this.http.delete<void>(this.url+"/user/"+id);
  }

  update(id: number, u: any): Observable<UserDto> {
    console.log('entro al service')
    console.log(u);
    return this.http.put<UserDto>(`${this.url}/user/${id}`, u);
  }

  findAllPageable(page: number) :Observable<any>{
    return  this.http.get<any>(`${this.url}/users/page/${page}`);
  }
}
