import { useState } from 'react';
import { DiscModelList } from '../components/inventory/DiscModelList';
import { DiscModelFilters } from '../components/inventory/DiscModelFilters';
import type { DiscModelFiltersState } from '../types/filters';

export function SelectDiscPage() {
  const [filters, setFilters] = useState<DiscModelFiltersState>({
    sort: 'name:asc' // Set default sorting
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Select a Disc</h1>
      </div>

      <DiscModelFilters filters={filters} onFilterChange={setFilters} />
      <DiscModelList filters={filters} />
    </div>
  );
}