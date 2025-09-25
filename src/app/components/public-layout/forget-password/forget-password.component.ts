import { Component } from '@angular/core';
import { UserDtoPassword } from '../../../models/user.dto.password';
import { RegisterService } from '../../../services/register.service';
import { FormsModule, NgForm } from '@angular/forms';
import { ForgetPassword } from '../../../models/forget.password';
import { Router } from '@angular/router';
import { ModalComponent } from '../../modal/modal.component';

@Component({
  selector: 'forget-password',
  imports: [FormsModule, ModalComponent],
  templateUrl: './forget-password.component.html',
  standalone: true
})
export class ForgetPasswordComponent {

  user!: ForgetPassword;
  isModalVisible = false;
  backendMessage = '';
  validation!: number;

  constructor(
    private registerService:RegisterService,
    private router:Router
  ){
    this.user = new ForgetPassword();
  }

  onSubmit(ngForm:NgForm){
    console.log(this.user)
    this.registerService.changePassTmp(this.user).subscribe(mensaje =>{
      
        console.log(mensaje)
        this.isModalVisible = true;
        this.backendMessage = mensaje.menssage;
        this.validation = mensaje.status;
    })
  }

  onModalClosed() {
    this.isModalVisible = false;
    if (this.validation === 200){
      this.router.navigate(['/inicio']); // 🚀 ahora navega aquí
    }
  }
}
