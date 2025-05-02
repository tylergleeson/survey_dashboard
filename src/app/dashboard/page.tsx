'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import GigDashboard from '@/components/dashboards/GigDashboard';
import SurveyDashboard from '@/components/dashboards/SurveyDashboard';

function Dashboard() {
  // Use the new GigDashboard as the default view
  return <GigDashboard />;
}

export default function ProtectedDashboard() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
} 