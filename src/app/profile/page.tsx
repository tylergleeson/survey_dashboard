'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface UserSettings {
  weekly_goal: number;
  notifications_enabled: boolean;
  dark_mode: boolean;
}

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  birthday: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings>({
    weekly_goal: 100,
    notifications_enabled: true,
    dark_mode: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, email, birthday')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        setProfile(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSettingChange = (setting: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Force a hard navigation to the login page to ensure complete state reset
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile Information</CardTitle>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Logout
          </button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-gray-600">Loading profile information...</div>
          ) : profile ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <div className="mt-1 text-lg">{profile.first_name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <div className="mt-1 text-lg">{profile.last_name}</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 text-lg">{profile.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Birthday</label>
                <div className="mt-1 text-lg">{new Date(profile.birthday).toLocaleDateString()}</div>
              </div>
            </div>
          ) : (
            <div className="text-gray-600">No profile information available</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Weekly Goal ($)</label>
            <input
              type="number"
              value={settings.weekly_goal}
              onChange={(e) => handleSettingChange('weekly_goal', Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Notifications</label>
            <Switch
              checked={settings.notifications_enabled}
              onCheckedChange={(checked) => handleSettingChange('notifications_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Dark Mode</label>
            <Switch
              checked={settings.dark_mode}
              onCheckedChange={(checked) => handleSettingChange('dark_mode', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 