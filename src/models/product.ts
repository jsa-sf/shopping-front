import {User} from './user';

export interface Product {
  id: number;
  name: string;
  quantity: number;
  owner: User;
  sharedUser?: User;
}
