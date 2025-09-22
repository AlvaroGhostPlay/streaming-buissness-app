import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {PhoneTypeDto} from '../models/phone.type';

@Injectable({
  providedIn: 'root'
})
export class PhonetypeService {
  private url: string = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  findAll(): Observable<PhoneTypeDto[]>{
    return this.http.get<PhoneTypeDto[]>(this.url+"/phone-types");
  }
}
