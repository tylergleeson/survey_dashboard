'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

interface UserSettings {
  weekly_goal: number;
  notifications_enabled: boolean;
  dark_mode: boolean;
}

export default function ProfilePage() {
  const [settings, setSettings] = useState<UserSettings>({
    weekly_goal: 100,
    notifications_enabled: true,
    dark_mode: false,
  });

  const handleSettingChange = (setting: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
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