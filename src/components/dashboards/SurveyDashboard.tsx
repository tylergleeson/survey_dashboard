import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { OnlineToggle } from '@/components/ui/online-toggle';
import { demandData, surveyDashboardData } from '@/lib/data/mock-dashboard';

export default function SurveyDashboard() {
  const [isOnline, setIsOnline] = useState(false);
  const { stats, rates } = surveyDashboardData;

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
            <span className="font-semibold">${rates.textSurvey.toFixed(2)} per text</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Phone Surveys</span>
            <span className="font-semibold">${rates.phoneCall.toFixed(2)} per minute</span>
          </div>
          {rates.surgePricing && (
            <Badge className="bg-blue-500 hover:bg-blue-600">Surge Pricing Active</Badge>
          )}
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
            <span>Current: ${stats.currentEarnings}</span>
            <span>Goal: ${stats.weeklyGoal}</span>
          </div>
          <Progress value={(stats.currentEarnings / stats.weeklyGoal) * 100} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{stats.completedSurveys}</p>
              <p className="text-sm text-gray-600">Completed Surveys</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{stats.callMinutes}</p>
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