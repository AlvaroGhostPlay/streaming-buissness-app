import { PhoneTypeDto } from "./phone.type";

export class PhonesReq{
  id?: number;
  number!: string;
  type!: PhoneTypeDto | null;  // <- se llama 'type'
}
