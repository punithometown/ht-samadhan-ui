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
import { FittingManagement } from './pages/FittingManagement';
import { WarehouseRequests } from './pages/WarehouseRequests';
import { PlaceholderPage } from './pages/Placeholder';
import { DeliveryAssignment } from './pages/DeliveryAssignment';
import { FittingAssignment } from './pages/FittingAssignment';
import { FitterTasksList } from './pages/fitter/FitterAgentListTasks';
import { FitterTaskDetail } from './pages/fitter/FitterAgentTaskDetail';
import { FitterTasksCompletedList } from './pages/fitter/FitterAgentCompletedListTasks';
import { DeliveryAgentTasksList } from './pages/delivery/DeliveryAgentTasksList';
import { DeliveryTaskUpdate } from './pages/delivery/DeliveryTaskUpdate';
import { DeliveryAgentCompletedTasksList } from './pages/delivery/DeliveryAgentCompletedTask';
import { StoreDashboard } from './pages/StoreDashboard';
import { DeliveryDashboard } from './pages/delivery/DeliveryDashboard';



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
            <Route path="/delivery-assign/:ticketId" element={<DeliveryAssignment />} />

            <Route path="/delivery-task/:id" element={<DeliveryTaskUpdate />} />
            <Route path="/delivery/tasks" element={<DeliveryAgentTasksList />} />
            <Route path="/delivery/tasks/delivery-completed-task" element={<DeliveryAgentCompletedTasksList />} />




            <Route path="/fittings" element={<FittingManagement />} />
            <Route path="/fitting-assign/:ticketId" element={<FittingAssignment />} />

            <Route path="/fitter/tasks" element={<FitterTasksList />} />
            <Route path="/fitter/fitter-completed-task" element={<FitterTasksCompletedList />} />
            <Route path="/fitter-task/:id" element={<FitterTaskDetail />} />

            <Route path="/tat-analysis" element={<TATAnalysis />} />
            <Route path="/warehouse/picks" element={<WarehouseRequests />} />
            <Route path="/performance" element={<PlaceholderPage title="Store Performance Analytics" />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/customers" element={<PlaceholderPage title="Customer Database Search" />} />
            <Route path="/inventory/pickups" element={<PlaceholderPage title="Pending Pickups" />} />
            <Route path="/inventory/status" element={<PlaceholderPage title="Stock Inventory Status" />} />
            <Route path="/dispatch" element={<PlaceholderPage title="Dispatch List" />} />
            {/* <Route path="/delivery/map" element={<PlaceholderPage title="Smart Route Planner" />} /> */}
            {/* <Route path="/delivery/pod" element={<PlaceholderPage title="Digital Proof of Delivery" />} /> */}
            {/* <Route path="/fitter/jobs" element={<PlaceholderPage title="Installation Job List" />} /> */}
            {/* <Route path="/fitter/schedule" element={<PlaceholderPage title="Job Schedule" />} /> */}
            {/* <Route path="/fitter/status" element={<PlaceholderPage title="Job Completion Reports" />} /> */}

            {/* Catch all internal dashboard routes */}
            <Route path="/store-dashboard" element={<StoreDashboard/>} />
            <Route path="/delivery-dashboard" element={<DeliveryDashboard/>} />



            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
