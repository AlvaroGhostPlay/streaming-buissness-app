import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserDtoPassword } from '../models/user.dto.password';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private url: string = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  saveRegister(u: any) :Observable<any>{
    return this.http.post<any>(this.url + "/register", u);
  }

  changPass(u: any) :Observable<any>{
    return this.http.post<any>(this.url + "/register/change-password", u);
  }

  changePassTmp(u: any) :Observable<any>{
    return this.http.post<any>(this.url + "/register/change-password-temp", u);
  }

  contactEmail(u:any):Observable<any>{
    return this.http.post<any>(this.url + "/contact-email", u);
  }
}
