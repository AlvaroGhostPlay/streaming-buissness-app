import { Component } from '@angular/core';
import { ChangePassword } from '../../../models/pass.change';
import { FormsModule } from '@angular/forms';
import { SharindDataService } from '../../../services/sharind-data.service';
import { RegisterService } from '../../../services/register.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../modal/modal.component';

@Component({
  selector: 'change-password',
  imports: [FormsModule, CommonModule, ModalComponent],
  templateUrl: './change-password.component.html',
  standalone: true,
})

export class ChangePasswordComponent {

  user!: ChangePassword
  isModalVisible = false;
  backendMessage = '';
  validation!: number;

  constructor(private sharingData:SharindDataService,
    private registerService:RegisterService,
    private loginService: AuthService,
    private router:Router,
  ){
    this.user= new ChangePassword();
  }

  ngOnInit(){
    this.sharingData.username$.subscribe(username => {
    if (username) {
      this.user.username = username;
    }
  });
  }

  onSubmit() {
    
      if(this.user.newPassword == this.user.confrPass){
        const password = this.user.oldPassword;
        const username = this.user.username;
        this.loginService.loginUser({username, password}).subscribe({
          next: response=>{

          },
          error: error=>{
            if(error.status == 428){
              this.registerService.changPass(this.user).subscribe(algo =>{
                if(algo.status == 200){
                  this.validation =200;
                  this.backendMessage = algo.message;
                  this.isModalVisible = true;
                }
              })
            }else{
              this.validation = error.status
              this.backendMessage = 'Usuario o Contraseña Invalidos'
              this.isModalVisible = true;
          }   
          }
        })
      }
    }

    onModalClosed() {
    this.isModalVisible = false;
    if (this.validation === 200){
      this.router.navigate(['/inicio']); // 🚀 ahora navega aquí
    }
  }
  }
