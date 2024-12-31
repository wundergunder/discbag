import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Search } from 'lucide-react';
import type { DiscModel, DiscManufacturer } from '../../../types/database';

interface DiscModelSelectProps {
  value: DiscModel | null;
  onChange: (model: DiscModel | null) => void;
}

interface ModelWithManufacturer extends DiscModel {
  manufacturer: DiscManufacturer;
}

export function DiscModelSelect({ value, onChange }: DiscModelSelectProps) {
  const [search, setSearch] = useState('');
  const [models, setModels] = useState<ModelWithManufacturer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadModels() {
      const { data, error } = await supabase
        .from('disc_models')
        .select(`
          *,
          manufacturer:manufacturer_id (*)
        `)
        .order('name');

      if (error) {
        console.error('Error loading disc models:', error);
        return;
      }

      setModels(data as ModelWithManufacturer[]);
      setLoading(false);
    }

    loadModels();
  }, []);

  const filteredModels = models.filter(model => 
    model.name.toLowerCase().includes(search.toLowerCase()) ||
    model.manufacturer.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search for a disc..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div>Loading disc models...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredModels.map((model) => (
            <button
              key={model.id}
              onClick={() => onChange(model)}
              className={`p-4 rounded-md text-left transition-colors ${
                value?.id === model.id
                  ? 'bg-blue-100 border-blue-500'
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              } border`}
            >
              <h3 className="font-medium">{model.name}</h3>
              <p className="text-sm text-gray-600">{model.manufacturer.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {model.speed} | {model.glide} | {model.turn} | {model.fade}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}