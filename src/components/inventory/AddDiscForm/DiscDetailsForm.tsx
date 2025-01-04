import { useState } from 'react';
import { Save } from 'lucide-react';
import type { UserDisc, DiscCondition } from '../../../types/database';

interface DiscDetailsFormProps {
  onSubmit: (data: Omit<UserDisc, 'id' | 'user_id' | 'disc_model_id' | 'created_at' | 'updated_at'>) => void;
  loading: boolean;
}

const CONDITIONS: { value: DiscCondition; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

export function DiscDetailsForm({ onSubmit, loading }: DiscDetailsFormProps) {
  const [formData, setFormData] = useState({
    disc_condition: 'new' as DiscCondition, // Updated from 'condition' to 'disc_condition'
    weight: '',
    color: '',
    personal_notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      weight: formData.weight ? parseInt(formData.weight) : null,
      storage_location_id: null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Condition
          </label>
          <select
            required
            value={formData.disc_condition}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              disc_condition: e.target.value as DiscCondition 
            }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {CONDITIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
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
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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