import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}