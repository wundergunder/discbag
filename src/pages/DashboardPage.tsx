import { useState, useEffect } from 'react';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { InventoryOverview } from '../components/dashboard/InventoryOverview';
import { MarketplaceActivity } from '../components/dashboard/MarketplaceActivity';
import { useAuth } from '../components/auth/AuthProvider';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';

export function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      setProfile(data);
      setLoading(false);
    }

    loadProfile();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Welcome, {profile?.username || 'Disc Golfer'}!
      </h1>
      
      <DashboardStats userId={user?.id} />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <InventoryOverview userId={user?.id} />
        <MarketplaceActivity userId={user?.id} />
      </div>
    </div>
  );
}