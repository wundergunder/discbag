import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ListingCard } from './ListingCard';
import type { MarketplaceFiltersState } from '../../pages/MarketplacePage';
import type { MarketplaceListing, UserDisc, DiscModel, Profile } from '../../types/database';

interface MarketplaceListingsProps {
  userId: string | undefined;
  filters: MarketplaceFiltersState;
}

interface ListingWithDetails extends MarketplaceListing {
  disc: UserDisc & {
    disc_model: DiscModel & {
      manufacturer: {
        name: string;
      };
    };
  };
  seller: Profile;
}

export function MarketplaceListings({ userId, filters }: MarketplaceListingsProps) {
  const [listings, setListings] = useState<ListingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadListings() {
      let query = supabase
        .from('marketplace_listings')
        .select(`
          *,
          disc:disc_id (
            *,
            disc_model:disc_model_id (
              *,
              manufacturer:manufacturer_id (name)
            )
          ),
          seller:user_id (*)
        `)
        .eq('is_active', true);

      if (filters.type) {
        query = query.eq('listing_type', filters.type);
      }
      if (filters.manufacturer) {
        query = query.eq('disc.disc_model.manufacturer_id', filters.manufacturer);
      }
      if (filters.discType) {
        query = query.eq('disc.disc_model.type', filters.discType);
      }
      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters.search) {
        query = query.or(`
          disc.disc_model.name.ilike.%${filters.search}%,
          disc.disc_model.manufacturer.name.ilike.%${filters.search}%,
          description.ilike.%${filters.search}%
        `);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading listings:', error);
        return;
      }

      setListings(data as ListingWithDetails[]);
      setLoading(false);
    }

    loadListings();
  }, [userId, filters]);

  if (loading) {
    return <div>Loading listings...</div>;
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No listings found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <ListingCard 
          key={listing.id} 
          listing={listing}
          isOwner={userId === listing.user_id}
        />
      ))}
    </div>
  );
}