import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DiscCard } from './DiscCard';
import type { InventoryFiltersState } from '../../pages/InventoryPage';
import type { UserDisc, DiscModel, DiscManufacturer } from '../../types/database';

interface InventoryListProps {
  userId: string | undefined;
  filters: InventoryFiltersState;
}

interface DiscWithDetails extends UserDisc {
  disc_model: DiscModel & {
    manufacturer: DiscManufacturer;
  };
  storage_location: {
    name: string;
  };
}

export function InventoryList({ userId, filters }: InventoryListProps) {
  const [discs, setDiscs] = useState<DiscWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDiscs() {
      if (!userId) return;

      let query = supabase
        .from('user_discs')
        .select(`
          *,
          disc_model:disc_model_id (
            *,
            manufacturer:manufacturer_id (*)
          ),
          storage_location:storage_location_id (name)
        `)
        .eq('user_id', userId);

      if (filters.manufacturer) {
        query = query.eq('disc_model.manufacturer_id', filters.manufacturer);
      }
      if (filters.discType) {
        query = query.eq('disc_model.type', filters.discType);
      }
      if (filters.condition) {
        query = query.eq('condition', filters.condition);
      }
      if (filters.location) {
        query = query.eq('storage_location_id', filters.location);
      }
      if (filters.search) {
        query = query.or(`
          disc_model.name.ilike.%${filters.search}%,
          disc_model.manufacturer.name.ilike.%${filters.search}%
        `);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading discs:', error);
        return;
      }

      setDiscs(data as DiscWithDetails[]);
      setLoading(false);
    }

    loadDiscs();
  }, [userId, filters]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (discs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No discs found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {discs.map((disc) => (
        <DiscCard key={disc.id} disc={disc} />
      ))}
    </div>
  );
}