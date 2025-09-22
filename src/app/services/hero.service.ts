import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Hero} from '../models/hero';
import {Card} from '../models/card';
import {Section} from '../models/section';
import {Nosotros} from '../models/nosotros';

@Injectable({
  providedIn: 'root'
})
export class HeroService {

  url: string= 'http://localhost:8080/api';

  constructor(private http:HttpClient) { }

  findAll() :Observable<Hero[]>{
    return  this.http.get<Hero[]>(this.url+"/hero");
  }

  findAllPlataforms() :Observable<Card[]>{
    return  this.http.get<Card[]>(this.url+"/plataforms");
  }

  findAllSectionInicio(tipo:number): Observable<Section>{
    return this.http.get<Section>(`${this.url}/section-image/${tipo}`);
  }

  findAllNostros(tipo:number): Observable<Nosotros[]> | null{
    return this.http.get<Nosotros[]>(`${this.url}/nosotros/${tipo}`);
  }

  findAllSectionInicioAuth(tipo:number): Observable<Section[]>{
    return this.http.get<Section[]>(`${this.url}/images-inicio/${tipo}`);
  }
}
