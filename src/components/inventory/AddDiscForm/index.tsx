import { useState } from 'react';
import { DiscModelSelect } from './DiscModelSelect';
import { DiscDetailsForm } from './DiscDetailsForm';
import { StorageLocationSelect } from './StorageLocationSelect';
import { supabase } from '../../../lib/supabase';
import type { DiscModel, UserDisc } from '../../../types/database';

interface AddDiscFormProps {
  userId: string | undefined;
  onSuccess: () => void;
}

export function AddDiscForm({ userId, onSuccess }: AddDiscFormProps) {
  const [selectedModel, setSelectedModel] = useState<DiscModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: Omit<UserDisc, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!userId || !selectedModel) return;

    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase
      .from('user_discs')
      .insert({
        ...formData,
        user_id: userId,
        disc_model_id: selectedModel.id,
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    onSuccess();
  };

  return (
    <div className="space-y-8">
      <DiscModelSelect
        value={selectedModel}
        onChange={setSelectedModel}
      />

      {selectedModel && (
        <>
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="font-medium mb-2">Selected Disc Details</h3>
            <p className="text-sm text-gray-600">
              Speed: {selectedModel.speed} | 
              Glide: {selectedModel.glide} | 
              Turn: {selectedModel.turn} | 
              Fade: {selectedModel.fade}
            </p>
            {selectedModel.description && (
              <p className="text-sm text-gray-600 mt-2">{selectedModel.description}</p>
            )}
          </div>

          <StorageLocationSelect />
          <DiscDetailsForm onSubmit={handleSubmit} loading={loading} />
        </>
      )}

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
    </div>
  );
}