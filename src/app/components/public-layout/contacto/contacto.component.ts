import { Component } from '@angular/core';
import { RegisterService } from '../../../services/register.service';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../modal/modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-contacto',
  imports: [FormsModule,ModalComponent],
  standalone: true,
  templateUrl: './contacto.component.html'
})
export class ContactoComponent {

  isModalVisible = false;
  backendMessage = '';
  validation!: number;

  errors = {
  name: '',
  email: '',
  phone: '',
  message: ''
};
 user = {
  name: '',
  email: '',
  phone: '',
  message: ''
};
  constructor(private registerService:RegisterService,
    private router:Router
  ){}

onSubmit() {
  this.registerService.contactEmail(this.user).subscribe({
    next: response =>{
      console.log(response)
      this.clear();
      this.validation = response.status;
        this.backendMessage = response.message;
        this.isModalVisible = true;
    },
    error: error=>{
      console.log(error)
      this.errors = error.error;
    }
  })
}

clear(){
    this.errors = {
  name: '',
  email: '',
  phone: '',
  message: ''
};
 this.user = {
  name: '',
  email: '',
  phone: '',
  message: ''
};
}

onModalClosed() {
    this.isModalVisible = false;
    if (this.validation === 200){
      this.router.navigate(['/inicio']); // 🚀 ahora navega aquí
    }

  }
}
