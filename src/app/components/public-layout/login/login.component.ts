import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {User} from '../../../models/user';
import {SharindDataService} from '../../../services/sharind-data.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  standalone: true,
})
export class LoginComponent {
  user!: User;

  constructor(private sharinData: SharindDataService) {
    this.user = new User();
  }

  onSubmit(){
    if (!this.user.username || !this.user.password){
      
    } else{
      this.sharinData.handlerLoginEventEmitter.emit({username: this.user.username, password: this.user.password});
    }
  }
}
