import {UserDto} from './user.dto';
import {Client} from './client';

export class UserResponse {
  user!: UserDto
  client!: Client;
}
