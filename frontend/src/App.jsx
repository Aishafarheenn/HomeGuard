import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'

import LandingPage from './screens/LandingPage'
import Login from './screens/Login'
import OwnerRegistration from './screens/OwnerRegistration'
import InspectorRegistration from './screens/InspectorRegistration'
import DashboardLayout from './components/layouts/DashboardLayout'
import Dashboard from './screens/dashboard/Dashboard'
import ServiceItems from './screens/dashboard/ServiceItems'
import Owners from './screens/dashboard/Owners'
import Properties from './screens/dashboard/Properties'
import Inspections from './screens/dashboard/Inspections'
import JobTickets from './screens/dashboard/Jobtickets'
import JobTicketDetail from './screens/dashboard/JobTicketDetail'
import Inspector from './screens/dashboard/Inspector'
import Complaint from './screens/dashboard/Complaint'
import Feedback from './screens/dashboard/Feedback'
import Notifications from './screens/dashboard/Notifications'
import MyJobs from './screens/dashboard/MyJobs'
import NotFoundPage from './screens/NotFoundPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/owner" element={<OwnerRegistration />} />
          <Route path="/register/inspector" element={<InspectorRegistration />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route
              path="serviceitems"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ServiceItems />
                </ProtectedRoute>
              }
            />
            <Route
              path="owners"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Owners />
                </ProtectedRoute>
              }
            />
            <Route
              path="properties"
              element={
                <ProtectedRoute allowedRoles={['admin', 'owner']}>
                  <Properties />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-jobs"
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <MyJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="inspections"
              element={
                <ProtectedRoute allowedRoles={['admin', 'owner']}>
                  <Inspections />
                </ProtectedRoute>
              }
            />
            <Route
              path="jobtickets/:ticketId"
              element={
                <ProtectedRoute allowedRoles={['admin', 'inspector']}>
                  <JobTicketDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="jobtickets"
              element={
                <ProtectedRoute allowedRoles={['admin', 'inspector']}>
                  <JobTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="inspector"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Inspector />
                </ProtectedRoute>
              }
            />
            <Route path="notifications" element={<Notifications />} />
            <Route path="complaints" element={<Complaint />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
