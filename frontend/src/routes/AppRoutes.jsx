import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Public pages
import Home from '../pages/Home';
import About from '../pages/About';
import Login from '../pages/Login';
import Register from '../pages/Register';
import EditProfile from '../pages/EditProfile';
import Notifications from '../pages/Notifications';
import HazardMap from '../pages/shared/HazardMap';

// Victim pages
import VictimDashboard from '../pages/victim/VictimDashboard';
import SOSPage from '../pages/victim/SOSPage';
import VictimCamps from '../pages/victim/VictimCamps';
import VictimMissingPersons from '../pages/victim/VictimMissingPersons';

// Volunteer pages
import VolunteerDashboard from '../pages/volunteer/VolunteerDashboard';
import VolunteerTasks from '../pages/volunteer/VolunteerTasks';
import VolunteerProfile from '../pages/volunteer/VolunteerProfile';

// NGO pages
import NGODashboard from '../pages/ngo/NGODashboard';
import NGOCamps from '../pages/ngo/NGOCamps';
import NGOResources from '../pages/ngo/NGOResources';
import NGOVolunteers from '../pages/ngo/NGOVolunteers';

// Government Officer pages
import GovDashboard from '../pages/gov/GovDashboard';
import GovDisasters from '../pages/gov/GovDisasters';
import GovAnnouncements from '../pages/gov/GovAnnouncements';
import GovReports from '../pages/gov/GovReports';
import GovForecast from '../pages/gov/GovForecast';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminAuditLogs from '../pages/admin/AdminAuditLogs';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Shared protected routes */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/hazard-map" 
        element={
          <ProtectedRoute>
            <HazardMap />
          </ProtectedRoute>
        } 
      />

      {/* Victim routes */}
      <Route 
        path="/victim/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['Victim']}>
            <VictimDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/victim/sos" 
        element={
          <ProtectedRoute allowedRoles={['Victim']}>
            <SOSPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/victim/camps" 
        element={
          <ProtectedRoute allowedRoles={['Victim']}>
            <VictimCamps />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/victim/missing-persons" 
        element={
          <ProtectedRoute allowedRoles={['Victim']}>
            <VictimMissingPersons />
          </ProtectedRoute>
        } 
      />

      {/* Volunteer routes */}
      <Route 
        path="/volunteer/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['Volunteer']}>
            <VolunteerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/volunteer/tasks" 
        element={
          <ProtectedRoute allowedRoles={['Volunteer']}>
            <VolunteerTasks />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/volunteer/profile" 
        element={
          <ProtectedRoute allowedRoles={['Volunteer']}>
            <VolunteerProfile />
          </ProtectedRoute>
        } 
      />

      {/* NGO routes */}
      <Route 
        path="/ngo/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['NGO']}>
            <NGODashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ngo/camps" 
        element={
          <ProtectedRoute allowedRoles={['NGO']}>
            <NGOCamps />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ngo/resources" 
        element={
          <ProtectedRoute allowedRoles={['NGO']}>
            <NGOResources />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ngo/volunteers" 
        element={
          <ProtectedRoute allowedRoles={['NGO']}>
            <NGOVolunteers />
          </ProtectedRoute>
        } 
      />

      {/* Government routes */}
      <Route 
        path="/gov/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['Government Officer']}>
            <GovDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/gov/disasters" 
        element={
          <ProtectedRoute allowedRoles={['Government Officer']}>
            <GovDisasters />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/gov/announcements" 
        element={
          <ProtectedRoute allowedRoles={['Government Officer']}>
            <GovAnnouncements />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/gov/reports" 
        element={
          <ProtectedRoute allowedRoles={['Government Officer']}>
            <GovReports />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/gov/forecast" 
        element={
          <ProtectedRoute allowedRoles={['Government Officer']}>
            <GovForecast />
          </ProtectedRoute>
        } 
      />

      {/* Admin routes */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminUsers />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/audit-logs" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminAuditLogs />
          </ProtectedRoute>
        } 
      />


      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
