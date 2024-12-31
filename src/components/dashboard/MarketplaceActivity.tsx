import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import type { MarketplaceListing, UserDisc, DiscModel } from '../../types/database';
import { Tag, Search } from 'lucide-react';

interface MarketplaceActivityProps {
  userId: string | undefined;
}

interface ListingWithDetails extends MarketplaceListing {
  disc: UserDisc & {
    disc_model: DiscModel;
  };
}

export function MarketplaceActivity({ userId }: MarketplaceActivityProps) {
  const [listings, setListings] = useState<ListingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadListings() {
      if (!userId) return;

      const { data, error } = await supabase
        .from('marketplace_listings')
        .select(`
          *,
          disc:disc_id (
            *,
            disc_model:disc_model_id (*)
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(5);

      if (error) {
        console.error('Error loading listings:', error);
        return;
      }

      setListings(data as ListingWithDetails[]);
      setLoading(false);
    }

    loadListings();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Marketplace Activity</h2>
        <Link
          to="/marketplace"
          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
          >
            <div className="flex items-center gap-3">
              {listing.listing_type === 'for_sale' ? (
                <Tag className="h-5 w-5 text-green-600" />
              ) : (
                <Search className="h-5 w-5 text-purple-600" />
              )}
              <div>
                <p className="font-medium">
                  {listing.disc.disc_model.name}
                </p>
                <p className="text-sm text-gray-600">
                  {listing.listing_type === 'for_sale' ? (
                    <>Selling for ${listing.price}</>
                  ) : (
                    'Looking to buy'
                  )}
                </p>
              </div>
            </div>
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              listing.listing_type === 'for_sale'
                ? 'bg-green-100 text-green-800'
                : 'bg-purple-100 text-purple-800'
            }`}>
              {listing.listing_type === 'for_sale' ? 'For Sale' : 'Wanted'}
            </span>
          </div>
        ))}

        {listings.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            No active marketplace listings.
          </p>
        )}
      </div>
    </div>
  );
}