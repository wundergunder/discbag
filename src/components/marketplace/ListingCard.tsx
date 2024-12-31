import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Trash2, Tag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { MarketplaceListing, UserDisc, DiscModel, Profile } from '../../types/database';

interface ListingCardProps {
  listing: MarketplaceListing & {
    disc: UserDisc & {
      disc_model: DiscModel & {
        manufacturer: {
          name: string;
        };
      };
    };
    seller: Profile;
  };
  isOwner: boolean;
}

export function ListingCard({ listing, isOwner }: ListingCardProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('marketplace_listings')
      .update({ is_active: false })
      .eq('id', listing.id);

    if (error) {
      console.error('Error deleting listing:', error);
      alert('Failed to delete listing');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">
              {listing.disc.disc_model.manufacturer.name} {listing.disc.disc_model.name}
            </h3>
            <p className="text-sm text-gray-600">
              {listing.listing_type === 'for_sale' ? 'For Sale' : 'Wanted'}
            </p>
          </div>
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Disc Images */}
        {(listing.disc.front_url || listing.disc.back_url) && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            {listing.disc.front_url && (
              <img
                src={listing.disc.front_url}
                alt="Disc front"
                className="w-full h-32 object-cover rounded-lg"
              />
            )}
            {listing.disc.back_url && (
              <img
                src={listing.disc.back_url}
                alt="Disc back"
                className="w-full h-32 object-cover rounded-lg"
              />
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Flight Numbers</p>
            <p className="font-medium">
              {listing.disc.disc_model.speed} | {listing.disc.disc_model.glide} | {' '}
              {listing.disc.disc_model.turn} | {listing.disc.disc_model.fade}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Condition</p>
            <p className="font-medium">
              {listing.disc.condition.replace('_', ' ').toUpperCase()}
            </p>
          </div>
        </div>

        {listing.listing_type === 'for_sale' && (
          <div className="mb-4">
            <p className="text-lg font-bold text-green-600">${listing.price}</p>
          </div>
        )}

        {listing.description && (
          <div className="text-sm text-gray-600 mb-4">
            <p className="font-medium mb-1">Description:</p>
            <p>{listing.description}</p>
          </div>
        )}

        {!isOwner && (
          <Link
            to={`/messages/new/${listing.id}`}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700 rounded-md"
          >
            <MessageCircle size={16} />
            Contact Seller
          </Link>
        )}
      </div>
    </div>
  );
}