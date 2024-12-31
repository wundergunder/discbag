import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../../lib/supabase';
import type { Profile, Visibility } from '../../types/database';
import { SaveIcon } from 'lucide-react';

interface ProfileFormProps {
  initialData: Profile | null;
  onComplete: () => void;
}

export function ProfileForm({ initialData, onComplete }: ProfileFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: initialData?.username || '',
    full_name: initialData?.full_name || '',
    bio: initialData?.bio || '',
    favorite_disc: initialData?.favorite_disc || '',
    favorite_golfer: initialData?.favorite_golfer || '',
    email: initialData?.email || user?.email || '',
    phone: initialData?.phone || '',
    inventory_visibility: initialData?.inventory_visibility || 'private' as Visibility,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user?.id,
        ...formData,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            required
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Favorite Disc</label>
          <input
            type="text"
            value={formData.favorite_disc}
            onChange={(e) => setFormData(prev => ({ ...prev, favorite_disc: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Favorite Golfer</label>
          <input
            type="text"
            value={formData.favorite_golfer}
            onChange={(e) => setFormData(prev => ({ ...prev, favorite_golfer: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Inventory Visibility</label>
          <select
            value={formData.inventory_visibility}
            onChange={(e) => setFormData(prev => ({ ...prev, inventory_visibility: e.target.value as Visibility }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
            <option value="friends">Friends Only</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {loading ? 'Saving...' : (
          <>
            <SaveIcon size={20} />
            <span>Save Profile</span>
          </>
        )}
      </button>
    </form>
  );
}