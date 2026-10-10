import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();
  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading…</div>;
  }
  if (!admin) return <Navigate to="/login" replace />;
  return children;
}
