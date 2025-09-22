import {Client} from './client';

export class UserDto{

    id!:number;
    username!: string;
    roles!: string[];
    client!: Client
}
