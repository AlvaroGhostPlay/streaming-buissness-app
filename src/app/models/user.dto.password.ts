import {Client} from './client';

export class UserDtoPassword{
    map(arg0: (r: any) => { id: any; username: any; client: Client; roles: string[]; }): any {
        throw new Error('Method not implemented.');
    }

  id!:number;
  password!: string;
  username!: string;
  roles!: string[];
  client!: Client
}
