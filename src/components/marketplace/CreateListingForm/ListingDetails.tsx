import { useState } from 'react';
import { Tag } from 'lucide-react';
import type { MarketplaceListing } from '../../../types/database';

interface ListingDetailsProps {
  onSubmit: (data: Omit<MarketplaceListing, 'id' | 'user_id' | 'disc_id' | 'created_at' | 'updated_at'>) => void;
  loading: boolean;
}

export function ListingDetails({ onSubmit, loading }: ListingDetailsProps) {
  const [formData, setFormData] = useState({
    listing_type: 'for_sale' as const,
    price: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: formData.price ? parseFloat(formData.price) : null,
      is_active: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Listing Type
        </label>
        <select
          required
          value={formData.listing_type}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            listing_type: e.target.value as 'for_sale' | 'wanted'
          }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="for_sale">For Sale</option>
          <option value="wanted">Wanted</option>
        </select>
      </div>

      {formData.listing_type === 'for_sale' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              price: e.target.value 
            }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            description: e.target.value 
          }))}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Add any additional details about the disc or your terms..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {loading ? 'Creating Listing...' : (
          <>
            <Tag size={20} />
            <span>Create Listing</span>
          </>
        )}
      </button>
    </form>
  );
}