import { Role, MenuItem } from './types';

export const MENU_CONFIG: Record<Role, MenuItem[]> = {
  [Role.ADMIN]: [
    { title: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { title: 'New Ticket', path: '/tickets/new', icon: 'PlusCircle' },
    { title: 'All Tickets', path: '/tickets', icon: 'Ticket' },
    // { title: 'TAT Analysis', path: '/tat-analysis', icon: 'BarChart3' },
    { title: 'User Management', path: '/users', icon: 'Users' },
  ],
  [Role.SERVICE_MANAGER]: [
    { title: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { title: 'New Ticket', path: '/tickets/new', icon: 'PlusCircle' },
    { title: 'All Tickets', path: '/tickets', icon: 'Ticket' },
    { title: 'Delivery Schdule', path: '/deliveries', icon: 'Truck' },
    { title: 'Fitting Schdule', path: '/fittings', icon: 'Wrench' },
    // { title: 'Fitter Workforce', path: '/fitters', icon: 'Users' },
    // { title: 'TAT Analysis', path: '/tat-analysis', icon: 'BarChart3' },
  ],
  [Role.WAREHOUSE]: [
    { title: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { title: 'Pick Requests', path: '/warehouse/picks', icon: 'ClipboardList' },
    // { title: 'Stock Status', path: '/inventory/status', icon: 'Database' },
    // { title: 'Dispatch List', path: '/dispatch', icon: 'Truck' },
  ],
  [Role.DELIVERY]: [
    { title: 'My Deliveries', path: '/delivery/tasks', icon: 'Truck' },
    { title: 'Route Map', path: '/delivery/map', icon: 'MapPin' },
    { title: 'Proof of Delivery', path: '/delivery/pod', icon: 'CheckSquare' },
  ],
  [Role.FITTER]: [
    { title: 'Home Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { title: 'My Job List', path: '/fitter/tasks', icon: 'Wrench' },
    { title: 'Daily Schedule', path: '/fitter/schedule', icon: 'Calendar' },
    { title: 'Service Reports', path: '/fitter/status', icon: 'CheckSquare' },
  ],
};
