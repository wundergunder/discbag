import { useState } from 'react';
import { SelectDisc } from './SelectDisc';
import { ListingDetails } from './ListingDetails';
import { supabase } from '../../../lib/supabase';
import type { UserDisc, MarketplaceListing } from '../../../types/database';

interface CreateListingFormProps {
  userId: string | undefined;
  onSuccess: () => void;
}

export function CreateListingForm({ userId, onSuccess }: CreateListingFormProps) {
  const [selectedDisc, setSelectedDisc] = useState<UserDisc | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: Omit<MarketplaceListing, 'id' | 'user_id' | 'disc_id' | 'created_at' | 'updated_at'>) => {
    if (!userId || !selectedDisc) return;

    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase
      .from('marketplace_listings')
      .insert({
        ...formData,
        user_id: userId,
        disc_id: selectedDisc.id,
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
      <SelectDisc
        userId={userId}
        value={selectedDisc}
        onChange={setSelectedDisc}
      />

      {selectedDisc && (
        <ListingDetails onSubmit={handleSubmit} loading={loading} />
      )}

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
    </div>
  );
}