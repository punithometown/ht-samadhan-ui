import { LucideIcon } from 'lucide-react';

export enum Role {
  HO = 'HO',
  STORE_MANAGER = 'STORE_MANAGER',
  WAREHOUSE = 'WAREHOUSE',
  DELIVERY = 'DELIVERY',
  FITTER = 'FITTER'
}

export interface MenuItem {
  title: string;
  path: string;
  icon: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  location?: string;
}
