import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {User} from '../../../models/user';
import {SharindDataService} from '../../../services/sharind-data.service';

@Component({
  selector: 'login',
  imports: [FormsModule],
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
      // @ts-ignore
      Swal.fire(
        'Error de validacion',
        'Username y passwprd Requerido',
        'Error'
      )
    } else{
      this.sharinData.handlerLoginEventEmitter.emit({username: this.user.username, password: this.user.password});
      console.log(this.user)
    }
  }
}
