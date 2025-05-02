import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { OnlineToggle } from '@/components/ui/online-toggle';

// Mock data for the demand graph
const demandData = [
  { hour: '9AM', demand: 20 },
  { hour: '12PM', demand: 45 },
  { hour: '3PM', demand: 30 },
  { hour: '6PM', demand: 60 },
  { hour: '9PM', demand: 40 },
];

export default function SurveyDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const [weeklyGoal] = useState(100);
  const [currentEarnings] = useState(0);
  const [completedSurveys] = useState(0);
  const [callMinutes] = useState(0);

  return (
    <div className="p-4 space-y-4">
      {/* Online/Offline Toggle */}
      <Card className="bg-white shadow-lg">
        <CardContent className="p-0">
          <OnlineToggle isOnline={isOnline} onToggle={setIsOnline} />
        </CardContent>
      </Card>

      {/* Current Rates */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Current Rates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-gray-700">
            <span>Text Surveys</span>
            <span className="font-semibold">$0.25 per text</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Phone Surveys</span>
            <span className="font-semibold">$1.00 per minute</span>
          </div>
          <Badge className="bg-blue-500 hover:bg-blue-600">Surge Pricing Active</Badge>
        </CardContent>
      </Card>

      {/* Demand Graph */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Survey Demand</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demandData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="demand" stroke="#3B82F6" fill="#93C5FD" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Weekly Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Current: ${currentEarnings}</span>
            <span>Goal: ${weeklyGoal}</span>
          </div>
          <Progress value={(currentEarnings / weeklyGoal) * 100} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{completedSurveys}</p>
              <p className="text-sm text-gray-600">Completed Surveys</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{callMinutes}</p>
              <p className="text-sm text-gray-600">Call Minutes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tips */}
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">Performance Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            You earn most on Wednesdays between 2-5 PM. Try to be online during these hours!
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 