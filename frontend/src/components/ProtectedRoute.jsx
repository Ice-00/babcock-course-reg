import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ROLE_META } from '../data/mockData'

export default function ProtectedRoute({ role, children }) {
  const { user } = useApp()
  if (!user) return <Navigate to="/" replace />
  if (user.role !== role) return <Navigate to={ROLE_META[user.role]?.portal || '/'} replace />
  return children
}
