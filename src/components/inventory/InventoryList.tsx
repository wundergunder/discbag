import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DiscCard } from './DiscCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
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
  } | null;
}

export function InventoryList({ userId, filters }: InventoryListProps) {
  const [discs, setDiscs] = useState<DiscWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDiscs() {
      if (!userId) return;

      try {
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

        if (error) throw error;

        setDiscs(data as DiscWithDetails[]);
      } catch (err) {
        console.error('Error loading discs:', err);
        setError('Failed to load discs. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadDiscs();
  }, [userId, filters]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
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