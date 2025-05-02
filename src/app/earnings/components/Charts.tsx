'use client';

import { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartsProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

export default function Charts({ data }: ChartsProps) {
  useEffect(() => {
    console.log('Charts component data:', data);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  try {
    return (
      <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (error) {
    console.error('Error rendering chart:', error);
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error rendering chart</p>
      </div>
    );
  }
} 