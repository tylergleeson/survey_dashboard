'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const Charts = dynamic(() => import('./components/Charts'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
});

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

function Earnings() {
  const [earnings] = useState<Earnings[]>(mockEarnings);
  const [isMounted, setIsMounted] = useState(false);
  const [chartData, setChartData] = useState<Array<{ name: string; value: number }>>([]);

  useEffect(() => {
    setIsMounted(true);
    
    // Process the data
    const dailyEarnings = earnings.reduce((acc, earning) => {
      const date = new Date(earning.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + earning.amount;
      return acc;
    }, {} as Record<string, number>);

    const processedData = Object.entries(dailyEarnings).map(([name, value]) => ({
      name,
      value
    }));

    console.log('Processing data:', {
      earnings,
      dailyEarnings,
      processedData
    });

    setChartData(processedData);
  }, [earnings]);

  if (!isMounted) {
    return (
      <div className="p-4">
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Loading Chart...</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Daily Earnings</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] relative">
          <div className="absolute inset-0">
            <Charts data={chartData} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProtectedEarnings() {
  return (
    <ProtectedRoute>
      <Earnings />
    </ProtectedRoute>
  );
} 