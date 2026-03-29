import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import ProtectedRoute          from './components/ProtectedRoute'
import LoginPage               from './pages/LoginPage'
import StudentPortal           from './pages/student/StudentPortal'
import AdviserPortal           from './pages/adviser/AdviserPortal'
import HODPortal               from './pages/hod/HODPortal'
import SchoolOfficerPortal     from './pages/schoolofficer/SchoolOfficerPortal'
import AcademicPlanningPortal  from './pages/academicplanning/AcademicPlanningPortal'
import RegistryPortal          from './pages/registry/RegistryPortal'
import AdminPortal             from './pages/admin/AdminPortal'

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route path="/student" element={
          <ProtectedRoute role="student"><StudentPortal /></ProtectedRoute>
        } />
        <Route path="/adviser" element={
          <ProtectedRoute role="adviser"><AdviserPortal /></ProtectedRoute>
        } />
        <Route path="/hod" element={
          <ProtectedRoute role="hod"><HODPortal /></ProtectedRoute>
        } />
        <Route path="/schoolofficer" element={
          <ProtectedRoute role="schoolofficer"><SchoolOfficerPortal /></ProtectedRoute>
        } />
        <Route path="/academicplanning" element={
          <ProtectedRoute role="academicplanning"><AcademicPlanningPortal /></ProtectedRoute>
        } />
        <Route path="/registry" element={
          <ProtectedRoute role="registry"><RegistryPortal /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminPortal /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  )
}
