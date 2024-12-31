import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Filter } from 'lucide-react';
import type { InventoryFiltersState } from '../../pages/InventoryPage';
import type { DiscManufacturer, StorageLocation } from '../../types/database';

interface InventoryFiltersProps {
  filters: InventoryFiltersState;
  onFilterChange: (filters: InventoryFiltersState) => void;
}

export function InventoryFilters({ filters, onFilterChange }: InventoryFiltersProps) {
  const [manufacturers, setManufacturers] = useState<DiscManufacturer[]>([]);
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function loadFilterOptions() {
      const [manufacturersResponse, locationsResponse] = await Promise.all([
        supabase.from('disc_manufacturers').select('*').order('name'),
        supabase.from('storage_locations').select('*').order('name'),
      ]);

      if (manufacturersResponse.data) {
        setManufacturers(manufacturersResponse.data);
      }
      if (locationsResponse.data) {
        setLocations(locationsResponse.data);
      }
    }

    loadFilterOptions();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search discs..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Filter size={20} />
          <span>Filters</span>
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white rounded-md border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manufacturer
            </label>
            <select
              value={filters.manufacturer || ''}
              onChange={(e) => onFilterChange({ ...filters, manufacturer: e.target.value })}
              className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Manufacturers</option>
              {manufacturers.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Disc Type
            </label>
            <select
              value={filters.discType || ''}
              onChange={(e) => onFilterChange({ ...filters, discType: e.target.value })}
              className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="distance">Distance Driver</option>
              <option value="fairway">Fairway Driver</option>
              <option value="midrange">Midrange</option>
              <option value="putter">Putter</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condition
            </label>
            <select
              value={filters.condition || ''}
              onChange={(e) => onFilterChange({ ...filters, condition: e.target.value as any })}
              className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Conditions</option>
              <option value="new">New</option>
              <option value="like_new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <select
              value={filters.location || ''}
              onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
              className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Locations</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}