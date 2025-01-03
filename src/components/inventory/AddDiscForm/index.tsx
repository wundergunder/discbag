import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { DiscDetailsForm } from './DiscDetailsForm';
import { StorageLocationSelect } from './StorageLocationSelect';
import type { DiscModel, UserDisc } from '../../../types/database';

interface AddDiscFormProps {
  userId: string | undefined;
  discModel: DiscModel;
  onSuccess: () => void;
}

export function AddDiscForm({ userId, discModel, onSuccess }: AddDiscFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageLocationId, setStorageLocationId] = useState<string | null>(null);

  const handleSubmit = async (formData: Omit<UserDisc, 'id' | 'user_id' | 'disc_model_id' | 'created_at' | 'updated_at'>) => {
    if (!userId || !storageLocationId) {
      setError('Please select a storage location');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('user_discs')
        .insert({
          ...formData,
          user_id: userId,
          disc_model_id: discModel.id,
          storage_location_id: storageLocationId
        });

      if (insertError) throw insertError;

      onSuccess();
    } catch (err) {
      console.error('Error adding disc:', err);
      setError('Failed to add disc to inventory');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <StorageLocationSelect
        userId={userId}
        value={storageLocationId}
        onChange={setStorageLocationId}
      />
      <DiscDetailsForm 
        onSubmit={handleSubmit} 
        loading={loading} 
      />
      
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}