import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthProvider';

export function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}