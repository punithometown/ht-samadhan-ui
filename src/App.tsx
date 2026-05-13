/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { Tickets } from './pages/Tickets';
import { CreateTicket } from './pages/CreateTicket';
import { TicketDetail } from './pages/TicketDetail';
import { UserManagement } from './pages/UserManagement';
import { TATAnalysis } from './pages/TATAnalysis';
import { DeliveryManagement } from './pages/DeliveryManagement';
import { DeliveryAgentTasks } from './pages/delivery/DeliveryAgentTasks';
import { FittingManagement } from './pages/FittingManagement';
import { FitterManagement } from './pages/FitterManagement';
import { FitterTasks } from './pages/fitter/FitterTasks';
import { WarehouseRequests } from './pages/WarehouseRequests';
import { PlaceholderPage } from './pages/Placeholder';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/tickets/new" element={<CreateTicket />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
            <Route path="/deliveries" element={<DeliveryManagement />} />
            <Route path="/fittings" element={<FittingManagement />} />
            <Route path="/fitters" element={<FitterManagement />} />
            <Route path="/tat-analysis" element={<TATAnalysis />} />
            <Route path="/warehouse/picks" element={<WarehouseRequests />} />
            <Route path="/performance" element={<PlaceholderPage title="Store Performance Analytics" />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/customers" element={<PlaceholderPage title="Customer Database Search" />} />
            <Route path="/inventory/pickups" element={<PlaceholderPage title="Pending Pickups" />} />
            <Route path="/inventory/status" element={<PlaceholderPage title="Stock Inventory Status" />} />
            <Route path="/dispatch" element={<PlaceholderPage title="Dispatch List" />} />
            <Route path="/delivery/tasks" element={<DeliveryAgentTasks />} />
            <Route path="/delivery/map" element={<PlaceholderPage title="Smart Route Planner" />} />
            <Route path="/delivery/pod" element={<PlaceholderPage title="Digital Proof of Delivery" />} />
            <Route path="/fitter/tasks" element={<FitterTasks />} />
            <Route path="/fitter/jobs" element={<PlaceholderPage title="Installation Job List" />} />
            <Route path="/fitter/schedule" element={<PlaceholderPage title="Job Schedule" />} />
            <Route path="/fitter/status" element={<PlaceholderPage title="Job Completion Reports" />} />
            
            {/* Catch all internal dashboard routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
