import { useState } from 'react';
import { Save } from 'lucide-react';
import { DiscImageUpload } from '../DiscImageUpload';
import type { UserDisc, DiscCondition } from '../../../types/database';

interface DiscDetailsFormProps {
  onSubmit: (data: Omit<UserDisc, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  loading: boolean;
  discId?: string;
}

export function DiscDetailsForm({ onSubmit, loading, discId }: DiscDetailsFormProps) {
  const [formData, setFormData] = useState({
    condition: 'new' as DiscCondition,
    weight: '',
    color: '',
    personal_notes: '',
    front_url: '',
    back_url: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      weight: formData.weight ? parseInt(formData.weight) : null,
    });
  };

  const handleImageUploaded = (urls: { front_url?: string; back_url?: string }) => {
    setFormData(prev => ({
      ...prev,
      ...urls,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {discId && (
        <DiscImageUpload
          discId={discId}
          onImageUploaded={handleImageUploaded}
          existingImages={{
            front_url: formData.front_url,
            back_url: formData.back_url,
          }}
        />
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Condition
          </label>
          <select
            required
            value={formData.condition}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              condition: e.target.value as DiscCondition 
            }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="new">New</option>
            <option value="like_new">Like New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Weight (g)
          </label>
          <input
            type="number"
            min="100"
            max="200"
            value={formData.weight}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              weight: e.target.value 
            }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Color
          </label>
          <input
            type="text"
            value={formData.color}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              color: e.target.value 
            }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Personal Notes
          </label>
          <textarea
            value={formData.personal_notes}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              personal_notes: e.target.value 
            }))}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {loading ? 'Adding Disc...' : (
          <>
            <Save size={20} />
            <span>Add to Inventory</span>
          </>
        )}
      </button>
    </form>
  );
}