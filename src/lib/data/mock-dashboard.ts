// Mock data types
export interface DemandDataPoint {
  hour: string;
  demand: number;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  earnings: number;
}

export interface DashboardStats {
  earnings: number;
  jobsCompleted: number;
  timeOnline: string;
  weeklyGoal: number;
  currentEarnings: number;
  completedSurveys: number;
  callMinutes: number;
}

// Mock data for the survey demand graph
export const demandData: DemandDataPoint[] = [
  { hour: '9AM', demand: 20 },
  { hour: '12PM', demand: 45 },
  { hour: '3PM', demand: 30 },
  { hour: '6PM', demand: 60 },
  { hour: '9PM', demand: 40 },
];

// Mock data for the gig dashboard
export const gigDashboardData = {
  stats: {
    earnings: 54.20,
    jobsCompleted: 8,
    timeOnline: "3h 22m"
  },
  recentActivity: [
    { id: "1234", timestamp: "14:30", earnings: 12.50 },
    { id: "1233", timestamp: "13:15", earnings: 15.75 },
    { id: "1232", timestamp: "12:00", earnings: 25.95 }
  ]
};

// Mock data for the survey dashboard
export const surveyDashboardData = {
  stats: {
    weeklyGoal: 100,
    currentEarnings: 0,
    completedSurveys: 0,
    callMinutes: 0
  },
  rates: {
    textSurvey: 0.25,
    phoneCall: 1.00,
    surgePricing: true
  }
}; 