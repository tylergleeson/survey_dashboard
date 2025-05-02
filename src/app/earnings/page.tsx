'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Earnings {
  id: string;
  amount: number;
  type: string;
  duration: string;
  created_at: string;
}

// Extended mock data for better visualization
const mockEarnings: Earnings[] = [
  {
    id: '1',
    amount: 2.50,
    type: 'text',
    duration: 'N/A',
    created_at: '2024-03-10T14:30:00Z'
  },
  {
    id: '2',
    amount: 5.00,
    type: 'call',
    duration: '5 minutes',
    created_at: '2024-03-10T15:00:00Z'
  },
  {
    id: '3',
    amount: 2.50,
    type: 'text',
    duration: 'N/A',
    created_at: '2024-03-10T16:15:00Z'
  },
  {
    id: '4',
    amount: 7.50,
    type: 'call',
    duration: '7.5 minutes',
    created_at: '2024-03-11T10:00:00Z'
  },
  {
    id: '5',
    amount: 2.50,
    type: 'text',
    duration: 'N/A',
    created_at: '2024-03-11T11:30:00Z'
  },
  {
    id: '6',
    amount: 10.00,
    type: 'call',
    duration: '10 minutes',
    created_at: '2024-03-11T14:00:00Z'
  }
];

// Colors for charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B'];

export default function Earnings() {
  const [earnings] = useState<Earnings[]>(mockEarnings);

  const calculateTotalEarnings = () => {
    return earnings.reduce((total, earning) => total + earning.amount, 0);
  };

  const calculateEarningsByType = (type: string) => {
    return earnings
      .filter(earning => earning.type === type)
      .reduce((total, earning) => total + earning.amount, 0);
  };

  // Prepare data for charts
  const dailyEarnings = earnings.reduce((acc, earning) => {
    const date = new Date(earning.created_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + earning.amount;
    return acc;
  }, {} as Record<string, number>);

  const dailyEarningsData = Object.entries(dailyEarnings).map(([date, amount]) => ({
    date,
    amount
  }));

  const earningsByTypeData = [
    { type: 'Text Surveys', value: calculateEarningsByType('text') },
    { type: 'Phone Calls', value: calculateEarningsByType('call') }
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Earnings Overview Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Daily Earnings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyEarningsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">Earnings Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={earningsByTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ type, value }) => `${type}: $${value}`}
                  >
                    {earningsByTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings History Table */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Earnings History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {earnings.map((earning) => (
                  <tr key={earning.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(earning.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {earning.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {earning.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${earning.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span>Total Earnings</span>
              <span className="font-semibold">${calculateTotalEarnings().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Text Surveys</span>
              <span className="font-semibold">${calculateEarningsByType('text').toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phone Surveys</span>
              <span className="font-semibold">${calculateEarningsByType('call').toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 