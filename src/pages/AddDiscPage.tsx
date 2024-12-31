import { Layout } from '../components/layout/Layout';
import { AddDiscForm } from '../components/inventory/AddDiscForm';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';

export function AddDiscPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSuccess = () => {
    navigate('/inventory');
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Add New Disc</h1>
        <AddDiscForm userId={user?.id} onSuccess={handleSuccess} />
      </div>
    </Layout>
  );
}