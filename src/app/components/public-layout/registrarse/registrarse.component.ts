import { Component } from '@angular/core';
import { UserDtoPassword } from '../../../models/user.dto.password';
import { FormsModule, NgForm } from '@angular/forms';
import { Client } from '../../../models/client';
import { PhonesReq } from '../../../models/phones';
import { PhoneTypeDto } from '../../../models/phone.type';
import { RoleService } from '../../../services/role.service';
import { PhonetypeService } from '../../../services/phonetype.service';
import { types } from 'util';
import { RegisterService } from '../../../services/register.service';
import { Router } from '@angular/router';
import { ModalComponent } from '../../modal/modal.component';
import { ClientRegister } from '../../../models/client.register';

@Component({
  selector: 'app-registrarse',
  imports: [FormsModule, ModalComponent],
  templateUrl: './registrarse.component.html',
  standalone: true
})
export class RegistrarseComponent {


  user!:ClientRegister;
  name1!:string;
  name2!:string
  lastname1!:string;
  lastname2!:string;

  isModalVisible = false;
  backendMessage = '';
  validation!: number;

  phoneType:PhoneTypeDto[]=[]

  constructor(
    private phoneTypeService:PhonetypeService,
    private registerService: RegisterService,
    private router:Router
  ){
    this.user = new ClientRegister();
  }

  ngOnInit(){
    this.user=this.initialUser();
    this.phoneTypeService.findAll().subscribe(types =>{
      this.phoneType = types;
    })

  }

  onSubmit(userForm: NgForm,) {
    this.registerService.saveRegister(this.user).subscribe({
      next:response =>{
        this.validation = response.status;
        this.backendMessage = response.message;
        this.isModalVisible = true;
    },
    error:response =>{
      console.log(response);
    }
      
    }
   )
    }

  initialUser(): ClientRegister {
    return {
        name1: '',
        name2: '',
        lastname1: '',
        lastname2: '',
        email: '',
        phones: [this.emptyPhone()],
      username: '',
      password: '',
      roles: []
    } as unknown as ClientRegister;
  }

  private emptyPhone(): PhonesReq {
      const type: PhoneTypeDto = {id: 0, name: '', code:''}
      return { id: undefined, number: '', type: type };  // o {code:'WORK'} si quieres default
  }

  byPhoneType = (a: PhoneTypeDto | null, b: PhoneTypeDto | null) =>
    !!a && !!b ? a.code === b.code : a === b;

  addPhone() {
    if (this.user.phones.length < 2) this.user.phones.push(this.emptyPhone());
  }

  removePhone(i: number) {
    this.user.phones.splice(i, 1);
    if (this.user.phones.length === 0) this.user.phones.push(this.emptyPhone());
  }

  onModalClosed() {
    this.isModalVisible = false;
    if (this.validation === 200){
      this.router.navigate(['/inicio']); // 🚀 ahora navega aquí
    }
  }

}
