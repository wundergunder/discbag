import { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { InventoryFilters } from '../components/inventory/InventoryFilters';
import { InventoryList } from '../components/inventory/InventoryList';
import { AddDiscButton } from '../components/inventory/AddDiscButton';
import { useAuth } from '../components/auth/AuthProvider';
import type { DiscCondition } from '../types/database';

export type InventoryFiltersState = {
  manufacturer?: string;
  discType?: string;
  condition?: DiscCondition;
  location?: string;
  search?: string;
};

export function InventoryPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<InventoryFiltersState>({});

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Disc Inventory</h1>
          <AddDiscButton />
        </div>

        <InventoryFilters filters={filters} onFilterChange={setFilters} />
        <InventoryList userId={user?.id} filters={filters} />
      </div>
    </Layout>
  );
}