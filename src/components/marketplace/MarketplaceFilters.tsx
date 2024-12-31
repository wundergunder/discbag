import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Filter } from 'lucide-react';
import type { MarketplaceFiltersState } from '../../pages/MarketplacePage';
import type { DiscManufacturer } from '../../types/database';

interface MarketplaceFiltersProps {
  filters: MarketplaceFiltersState;
  onFilterChange: (filters: MarketplaceFiltersState) => void;
}

export function MarketplaceFilters({ filters, onFilterChange }: MarketplaceFiltersProps) {
  const [manufacturers, setManufacturers] = useState<DiscManufacturer[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function loadManufacturers() {
      const { data } = await supabase
        .from('disc_manufacturers')
        .select('*')
        .order('name');

      if (data) {
        setManufacturers(data);
      }
    }

    loadManufacturers();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search listings..."
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
              Listing Type
            </label>
            <select
              value={filters.type || ''}
              onChange={(e) => onFilterChange({ ...filters, type: e.target.value as any })}
              className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Listings</option>
              <option value="for_sale">For Sale</option>
              <option value="wanted">Wanted</option>
            </select>
          </div>

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
              Price Range
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ''}
                onChange={(e) => onFilterChange({ 
                  ...filters, 
                  minPrice: e.target.value ? Number(e.target.value) : undefined 
                })}
                className="w-1/2 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ''}
                onChange={(e) => onFilterChange({ 
                  ...filters, 
                  maxPrice: e.target.value ? Number(e.target.value) : undefined 
                })}
                className="w-1/2 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}