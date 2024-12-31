import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import type { UserDisc, DiscModel, DiscManufacturer } from '../../types/database';
import { PlusCircle } from 'lucide-react';

interface InventoryOverviewProps {
  userId: string | undefined;
}

interface DiscWithDetails extends UserDisc {
  disc_model: DiscModel & {
    manufacturer: DiscManufacturer;
  };
}

export function InventoryOverview({ userId }: InventoryOverviewProps) {
  const [discs, setDiscs] = useState<DiscWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDiscs() {
      if (!userId) return;

      const { data, error } = await supabase
        .from('user_discs')
        .select(`
          *,
          disc_model:disc_model_id (
            *,
            manufacturer:manufacturer_id (*)
          )
        `)
        .eq('user_id', userId)
        .limit(5);

      if (error) {
        console.error('Error loading discs:', error);
        return;
      }

      setDiscs(data as DiscWithDetails[]);
      setLoading(false);
    }

    loadDiscs();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Discs</h2>
        <Link
          to="/inventory"
          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
        >
          <PlusCircle size={16} />
          Add Disc
        </Link>
      </div>

      <div className="space-y-4">
        {discs.map((disc) => (
          <div
            key={disc.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
          >
            <div>
              <p className="font-medium">
                {disc.disc_model.manufacturer.name} {disc.disc_model.name}
              </p>
              <p className="text-sm text-gray-600">
                Speed: {disc.disc_model.speed} | 
                Glide: {disc.disc_model.glide} | 
                Turn: {disc.disc_model.turn} | 
                Fade: {disc.disc_model.fade}
              </p>
            </div>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-gray-200">
              {disc.condition}
            </span>
          </div>
        ))}

        {discs.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            No discs in your inventory yet.
          </p>
        )}

        {discs.length > 0 && (
          <Link
            to="/inventory"
            className="block text-center text-sm text-gray-600 hover:text-gray-800 mt-4"
          >
            View all discs →
          </Link>
        )}
      </div>
    </div>
  );
}