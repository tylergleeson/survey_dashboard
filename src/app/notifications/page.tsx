'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock data for notifications
const notifications = [
  {
    id: 1,
    title: 'High Demand Alert',
    message: 'Survey demand is high right now! Go online to earn more.',
    timestamp: '2 hours ago',
    type: 'alert',
  },
  {
    id: 2,
    title: 'Bonus Opportunity',
    message: 'Complete 5 surveys today to earn a $5 bonus!',
    timestamp: '5 hours ago',
    type: 'bonus',
  },
  {
    id: 3,
    title: 'Survey Completed',
    message: 'You earned $2.50 for completing a text survey',
    timestamp: 'Yesterday',
    type: 'earnings',
  },
];

export default function Notifications() {
  return (
    <div className="p-4 space-y-4">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 rounded-lg bg-gray-50 border border-gray-200 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                  </div>
                  <Badge
                    variant={
                      notification.type === 'alert'
                        ? 'destructive'
                        : notification.type === 'bonus'
                        ? 'default'
                        : 'secondary'
                    }
                    className={
                      notification.type === 'alert'
                        ? 'bg-red-500'
                        : notification.type === 'bonus'
                        ? 'bg-blue-500'
                        : 'bg-gray-500'
                    }
                  >
                    {notification.type}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {notification.timestamp}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 