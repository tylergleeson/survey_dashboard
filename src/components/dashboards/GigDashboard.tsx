import React from 'react';
import { BellIcon, UserCircleIcon, ClockIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon }) => (
  <div className="bg-gray-800 rounded-xl p-4 flex flex-col">
    <span className="text-gray-400 text-sm mb-2">{label}</span>
    <div className="flex items-center gap-2">
      {icon && <div className="text-gray-400">{icon}</div>}
      <span className="text-white text-2xl font-bold">{value}</span>
    </div>
  </div>
);

interface ActivityItemProps {
  id: string;
  timestamp: string;
  earnings: number;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ id, timestamp, earnings }) => (
  <div className="bg-gray-800 rounded-lg p-4 mb-3 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <ClipboardDocumentIcon className="h-6 w-6 text-gray-400" />
      <div className="flex flex-col">
        <span className="text-white font-semibold">Delivery #{id}</span>
        <span className="text-gray-400 text-sm">Completed at {timestamp}</span>
      </div>
    </div>
    <span className="text-white font-bold">${earnings.toFixed(2)}</span>
  </div>
);

export default function GigDashboard() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = React.useState(false);

  // Example data - in real app, this would come from your backend
  const stats = {
    earnings: 54.20,
    jobsCompleted: 8,
    timeOnline: "3h 22m"
  };

  const recentActivity = [
    { id: "1234", timestamp: "14:30", earnings: 12.50 },
    { id: "1233", timestamp: "13:15", earnings: 15.75 },
    { id: "1232", timestamp: "12:00", earnings: 25.95 }
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <UserCircleIcon className="h-12 w-12 text-white" />
          <h1 className="text-white text-2xl font-bold">
            Welcome, {user?.email?.split('@')[0] || 'User'}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-800">
            <BellIcon className="h-6 w-6 text-white" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-800">
            <UserCircleIcon className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>

      {/* Online Toggle Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`px-8 py-3 rounded-full text-white font-semibold transition-colors ${
            isOnline ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard 
          label="Today's Earnings" 
          value={`$${stats.earnings.toFixed(2)}`} 
        />
        <StatCard 
          label="Jobs Completed" 
          value={stats.jobsCompleted} 
        />
        <StatCard 
          label="Time Online" 
          value={stats.timeOnline}
          icon={<ClockIcon className="h-5 w-5" />}
        />
      </div>

      {/* Recent Activity Section */}
      <div className="mb-4">
        <h2 className="text-white text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <ActivityItem
              key={activity.id}
              id={activity.id}
              timestamp={activity.timestamp}
              earnings={activity.earnings}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 