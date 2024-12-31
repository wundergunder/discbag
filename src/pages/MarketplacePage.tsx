import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { MarketplaceFilters } from '../components/marketplace/MarketplaceFilters';
import { MarketplaceListings } from '../components/marketplace/MarketplaceListings';
import { CreateListingButton } from '../components/marketplace/CreateListingButton';
import { useAuth } from '../components/auth/AuthProvider';
import type { ListingType } from '../types/database';

export type MarketplaceFiltersState = {
  type?: ListingType;
  manufacturer?: string;
  discType?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
};

export function MarketplacePage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<MarketplaceFiltersState>({});

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Disc Marketplace</h1>
          <CreateListingButton />
        </div>

        <MarketplaceFilters filters={filters} onFilterChange={setFilters} />
        <MarketplaceListings userId={user?.id} filters={filters} />
      </div>
    </Layout>
  );
}