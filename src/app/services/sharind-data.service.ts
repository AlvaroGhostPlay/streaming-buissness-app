import { Injectable } from '@angular/core';
import {EventEmitter} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {UserDtoPassword} from '../models/user.dto.password';

@Injectable({
  providedIn: 'root'
})
export class SharindDataService {
  setUser(u: any | null) {
    this._user$.next(u);
  }

  private _handlerLoginEventEmitter = new EventEmitter();

  handlerUserCreateEventEmitter = new EventEmitter<any>();
  handlerUserUpdateEventEmitter = new EventEmitter<{id: number, payload: any}>();
  handlerUserDeleteEventEmitter = new EventEmitter<{id: number}>();

  private _user$ = new BehaviorSubject<any | null>(null);
  user$ = this._user$.asObservable();

  constructor() { }

  get handlerLoginEventEmitter(){
    return this._handlerLoginEventEmitter;
  }
}
