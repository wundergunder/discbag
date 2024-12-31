import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth/AuthProvider';
import type { StorageLocation } from '../../../types/database';

export function StorageLocationSelect() {
  const { user } = useAuth();
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  useEffect(() => {
    async function loadLocations() {
      if (!user) return;

      const { data, error } = await supabase
        .from('storage_locations')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        console.error('Error loading storage locations:', error);
        return;
      }

      setLocations(data);
      if (data.length > 0) {
        setSelectedLocation(data[0].id);
      }
    }

    loadLocations();
  }, [user]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Storage Location
      </label>
      <select
        value={selectedLocation}
        onChange={(e) => setSelectedLocation(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name}
          </option>
        ))}
      </select>
    </div>
  );
}