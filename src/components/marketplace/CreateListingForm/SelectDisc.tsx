import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Search } from 'lucide-react';
import type { UserDisc, DiscModel } from '../../../types/database';

interface SelectDiscProps {
  userId: string | undefined;
  value: UserDisc | null;
  onChange: (disc: UserDisc | null) => void;
}

interface DiscWithDetails extends UserDisc {
  disc_model: DiscModel & {
    manufacturer: {
      name: string;
    };
  };
}

export function SelectDisc({ userId, value, onChange }: SelectDiscProps) {
  const [search, setSearch] = useState('');
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
            manufacturer:manufacturer_id (name)
          )
        `)
        .eq('user_id', userId)
        .not('id', 'in', (
          supabase
            .from('marketplace_listings')
            .select('disc_id')
            .eq('is_active', true)
        ));

      if (error) {
        console.error('Error loading discs:', error);
        return;
      }

      setDiscs(data as DiscWithDetails[]);
      setLoading(false);
    }

    loadDiscs();
  }, [userId]);

  const filteredDiscs = discs.filter(disc => 
    disc.disc_model.name.toLowerCase().includes(search.toLowerCase()) ||
    disc.disc_model.manufacturer.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Select a Disc to List</h2>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search your discs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div>Loading your discs...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredDiscs.map((disc) => (
            <button
              key={disc.id}
              onClick={() => onChange(disc)}
              className={`p-4 rounded-md text-left transition-colors ${
                value?.id === disc.id
                  ? 'bg-blue-100 border-blue-500'
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              } border`}
            >
              <h3 className="font-medium">
                {disc.disc_model.manufacturer.name} {disc.disc_model.name}
              </h3>
              <p className="text-sm text-gray-600">
                Condition: {disc.condition.replace('_', ' ').toUpperCase()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Speed: {disc.disc_model.speed} | 
                Glide: {disc.disc_model.glide} | 
                Turn: {disc.disc_model.turn} | 
                Fade: {disc.disc_model.fade}
              </p>
            </button>
          ))}

          {filteredDiscs.length === 0 && (
            <div className="col-span-2 text-center py-4 text-gray-500">
              No available discs found. Add some discs to your inventory first!
            </div>
          )}
        </div>
      )}
    </div>
  );
}