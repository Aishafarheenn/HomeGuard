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
import Inspector from './screens/dashboard/Inspector'
import Complaint from './screens/dashboard/Complaint'
import Feedback from './screens/dashboard/Feedback'


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
            <Route path="serviceitems" element={<ServiceItems />} />
            <Route path="owners" element={<Owners />} />
            <Route path="properties" element={<Properties />} />
            <Route path="inspections" element={<Inspections />} />
            <Route path="jobtickets" element={<JobTickets />} />
            <Route path="inspector" element={<Inspector />} />
            <Route path="complaints" element={<Complaint />} /> 
            <Route path="feedback" element={<Feedback />} /> 
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
