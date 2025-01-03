import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { StorageLocation } from '../../../types/database';

interface StorageLocationSelectProps {
  userId: string | undefined;
  value: string | null;
  onChange: (locationId: string | null) => void;
}

export function StorageLocationSelect({ userId, value, onChange }: StorageLocationSelectProps) {
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLocations() {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('storage_locations')
          .select('id, name')
          .eq('user_id', userId)
          .order('name');

        if (error) throw error;

        // Remove duplicates by ID
        const uniqueLocations = Object.values(
          data.reduce((acc, location) => {
            acc[location.id] = location;
            return acc;
          }, {} as Record<string, StorageLocation>)
        );

        setLocations(uniqueLocations);
        
        // Set default value if none selected
        if (!value && uniqueLocations.length > 0) {
          onChange(uniqueLocations[0].id);
        }
      } catch (err) {
        console.error('Error loading storage locations:', err);
        setError('Failed to load storage locations');
      } finally {
        setLoading(false);
      }
    }

    loadLocations();
  }, [userId]);

  if (loading) return <div>Loading storage locations...</div>;
  if (error) return <div className="text-red-600 text-sm">{error}</div>;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Storage Location
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        required
      >
        <option value="">Select a location</option>
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name}
          </option>
        ))}
      </select>
    </div>
  );
}