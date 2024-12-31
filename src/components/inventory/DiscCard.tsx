import { useState } from 'react';
import { Edit2, Trash2, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { UserDisc, DiscModel, DiscManufacturer } from '../../types/database';

interface DiscCardProps {
  disc: UserDisc & {
    disc_model: DiscModel & {
      manufacturer: DiscManufacturer;
    };
    storage_location: {
      name: string;
    };
  };
}

export function DiscCard({ disc }: DiscCardProps) {
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this disc?')) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('user_discs')
      .delete()
      .eq('id', disc.id);

    if (error) {
      console.error('Error deleting disc:', error);
      alert('Failed to delete disc');
    }
    setLoading(false);
  };

  const getConditionColor = (condition: string) => {
    const colors = {
      new: 'bg-green-100 text-green-800',
      like_new: 'bg-blue-100 text-blue-800',
      good: 'bg-yellow-100 text-yellow-800',
      fair: 'bg-orange-100 text-orange-800',
      poor: 'bg-red-100 text-red-800',
    };
    return colors[condition as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">
              {disc.disc_model.manufacturer.name} {disc.disc_model.name}
            </h3>
            <p className="text-sm text-gray-600">{disc.disc_model.type}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <button
              onClick={() => {/* TODO: Implement edit */}}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-1 text-gray-400 hover:text-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Disc Images */}
        {(disc.front_url || disc.back_url) && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            {disc.front_url && (
              <div>
                <img
                  src={disc.front_url}
                  alt="Disc front"
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}
            {disc.back_url && (
              <div>
                <img
                  src={disc.back_url}
                  alt="Disc back"
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Flight Numbers</p>
            <p className="font-medium">
              {disc.disc_model.speed} | {disc.disc_model.glide} | {' '}
              {disc.disc_model.turn} | {disc.disc_model.fade}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Location</p>
            <p className="font-medium">{disc.storage_location.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(disc.condition)}`}>
            {disc.condition.replace('_', ' ').toUpperCase()}
          </span>
          {disc.weight && (
            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
              {disc.weight}g
            </span>
          )}
          {disc.color && (
            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
              {disc.color}
            </span>
          )}
        </div>

        {showDetails && disc.personal_notes && (
          <div className="text-sm text-gray-600 mt-4">
            <p className="font-medium mb-1">Notes:</p>
            <p>{disc.personal_notes}</p>
          </div>
        )}

        <button
          className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700 rounded-md"
        >
          <Tag size={16} />
          List for Sale
        </button>
      </div>
    </div>
  );
}