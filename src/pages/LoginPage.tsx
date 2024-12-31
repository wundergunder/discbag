import { Link, useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { Disc } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Disc className="h-12 w-12 text-blue-600 mx-auto" />
          <h1 className="text-2xl font-bold mt-4">Welcome back!</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <LoginForm onSuccess={handleSuccess} />

        <p className="text-center mt-8 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}