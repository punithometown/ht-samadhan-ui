import { LucideIcon } from 'lucide-react';

export enum Role {
  ADMIN = 'ADMIN',
  SERVICE_MANAGER = 'SERVICE_MANAGER',
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
  role: string;
  email: string;
  location?: string;
  siteId?: string;
}
