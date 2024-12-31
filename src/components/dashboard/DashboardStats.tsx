import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Disc, ShoppingBag, ListChecks } from 'lucide-react';

interface DashboardStatsProps {
  userId: string | undefined;
}

export function DashboardStats({ userId }: DashboardStatsProps) {
  const [stats, setStats] = useState({
    totalDiscs: 0,
    activeListings: 0,
    wishlistItems: 0,
  });

  useEffect(() => {
    async function loadStats() {
      if (!userId) return;

      const [discsCount, listingsCount, wishlistCount] = await Promise.all([
        supabase
          .from('user_discs')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        supabase
          .from('marketplace_listings')
          .select('id', { count: 'exact' })
          .eq('user_id', userId)
          .eq('is_active', true)
          .eq('listing_type', 'for_sale'),
        supabase
          .from('marketplace_listings')
          .select('id', { count: 'exact' })
          .eq('user_id', userId)
          .eq('is_active', true)
          .eq('listing_type', 'wanted'),
      ]);

      setStats({
        totalDiscs: discsCount.count || 0,
        activeListings: listingsCount.count || 0,
        wishlistItems: wishlistCount.count || 0,
      });
    }

    loadStats();
  }, [userId]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Disc className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Discs</p>
            <p className="text-2xl font-semibold">{stats.totalDiscs}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-full">
            <ShoppingBag className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Active Listings</p>
            <p className="text-2xl font-semibold">{stats.activeListings}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <ListChecks className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Wishlist Items</p>
            <p className="text-2xl font-semibold">{stats.wishlistItems}</p>
          </div>
        </div>
      </div>
    </div>
  );
}