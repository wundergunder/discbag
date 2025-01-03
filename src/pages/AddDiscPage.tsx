import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthProvider';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { AddDiscForm } from '../components/inventory/AddDiscForm';
import type { DiscModel, DiscManufacturer } from '../types/database';

interface DiscModelWithDetails extends DiscModel {
  manufacturer: DiscManufacturer;
}

export function AddDiscPage() {
  const { modelId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [discModel, setDiscModel] = useState<DiscModelWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDiscModel() {
      if (!modelId) {
        setError('No disc model selected');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('disc_models')
          .select('*, manufacturer:manufacturer_id(*)')
          .eq('id', modelId)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Disc model not found');

        setDiscModel(data as DiscModelWithDetails);
      } catch (err) {
        console.error('Error loading disc model:', err);
        setError('Failed to load disc model');
      } finally {
        setLoading(false);
      }
    }

    loadDiscModel();
  }, [modelId]);

  const handleSuccess = () => {
    navigate('/inventory');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !discModel) {
    return (
      <EmptyState
        icon="alert-circle"
        title="Error Loading Disc"
        description={error || 'Disc model not found'}
        action={{
          label: 'Back to Selection',
          onClick: () => navigate('/inventory/select')
        }}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add {discModel.manufacturer.name} {discModel.name}</h1>
        <p className="text-gray-600 mt-2">Add this disc to your inventory</p>
      </div>

      <div className="bg-blue-50 p-4 rounded-md mb-8">
        <h3 className="font-medium mb-2">Disc Details</h3>
        <p className="text-sm text-gray-600">
          Type: {discModel.type}
        </p>
        <p className="text-sm text-gray-600">
          Flight Numbers: {discModel.speed} | {discModel.glide} | {discModel.turn} | {discModel.fade}
        </p>
        {discModel.description && (
          <p className="text-sm text-gray-600 mt-2">{discModel.description}</p>
        )}
      </div>

      <AddDiscForm 
        userId={user?.id}
        discModel={discModel}
        onSuccess={handleSuccess}
      />
    </div>
  );
}