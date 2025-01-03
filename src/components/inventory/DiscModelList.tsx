import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { DiscModelGrid } from './DiscModelGrid';
import { EmptyState } from '../common/EmptyState';
import type { DiscModel, DiscManufacturer } from '../../types/database';
import type { DiscModelFiltersState } from '../../types/filters';

interface DiscModelListProps {
  filters: DiscModelFiltersState;
}

interface DiscModelWithDetails extends DiscModel {
  manufacturer: DiscManufacturer;
}

export function DiscModelList({ filters }: DiscModelListProps) {
  const [models, setModels] = useState<DiscModelWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadModels() {
      try {
        let query = supabase
          .from('disc_models')
          .select('*, manufacturer:manufacturer_id(*)');

        // Apply filters
        if (filters.manufacturer) {
          query = query.eq('manufacturer_id', filters.manufacturer);
        }
        if (filters.type) {
          query = query.eq('type', filters.type);
        }
        if (filters.search) {
          // Fix: Use proper query format for search
          query = query.or(
            `name.ilike.%${filters.search}%,manufacturer:manufacturer_id(name).ilike.%${filters.search}%`
          );
        }

        // Apply sorting
        if (filters.sort) {
          const [field, direction] = filters.sort.split(':');
          if (field === 'name') {
            query = query.order('name', { ascending: direction === 'asc' });
          } else if (field === 'speed') {
            query = query.order('speed', { ascending: direction === 'asc' });
          }
        } else {
          query = query.order('name');
        }

        const { data, error } = await query;

        if (error) throw error;
        if (!data) throw new Error('No data returned');

        setModels(data as DiscModelWithDetails[]);
        setError(null);
      } catch (err) {
        console.error('Error loading disc models:', err);
        setError('Failed to load disc models. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    loadModels();
  }, [filters]);

  const handleSelectDisc = (model: DiscModelWithDetails) => {
    navigate(`/inventory/add/${model.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon="alert-circle"
        title="Error Loading Discs"
        description={error}
        action={{
          label: 'Try Again',
          onClick: () => window.location.reload()
        }}
      />
    );
  }

  if (models.length === 0) {
    return (
      <EmptyState
        icon="disc"
        title="No Discs Found"
        description="No discs match your current filters. Try adjusting your search criteria."
      />
    );
  }

  return <DiscModelGrid models={models} onSelect={handleSelectDisc} />;
}