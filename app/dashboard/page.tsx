'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  ListTodo,
  AlertCircle,
  Calendar,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
}

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentTasks: Task[];
  upcomingTasks: Task[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Replace with your actual API endpoint
      const response = await fetch('/api/dashboard', {
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      setData(result);
      toast.success('Dashboard loaded successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error('Failed to load dashboard', {
        description: errorMessage,
      });

      // Mock data for demo purposes - Remove this in production
      setData({
        stats: {
          totalTasks: 24,
          completedTasks: 12,
          pendingTasks: 8,
          inProgressTasks: 4,
          overdueTasks: 3,
          completionRate: 50,
        },
        recentTasks: [
          {
            id: '1',
            title: 'Complete project proposal',
            description: 'Finish the Q4 project proposal document',
            status: 'completed',
            priority: 'high',
            dueDate: '2024-12-05',
            createdAt: '2024-12-01',
          },
          {
            id: '2',
            title: 'Review code changes',
            description: 'Review pull request #234',
            status: 'in-progress',
            priority: 'medium',
            dueDate: '2024-12-04',
            createdAt: '2024-12-02',
          },
          {
            id: '3',
            title: 'Update documentation',
            description: 'Update API documentation for v2.0',
            status: 'pending',
            priority: 'low',
            dueDate: '2024-12-10',
            createdAt: '2024-12-03',
          },
        ],
        upcomingTasks: [
          {
            id: '4',
            title: 'Team meeting',
            description: 'Weekly team sync meeting',
            status: 'pending',
            priority: 'medium',
            dueDate: '2024-12-04',
            createdAt: '2024-12-01',
          },
          {
            id: '5',
            title: 'Deploy to production',
            description: 'Deploy version 2.0 to production',
            status: 'pending',
            priority: 'high',
            dueDate: '2024-12-05',
            createdAt: '2024-12-02',
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your task overview.</p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline">
          <Loader2 className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">All tasks in the system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {data.stats.completionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">Currently working on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.overdueTasks}</div>
            <p className="text-xs text-muted-foreground">Need immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Progress
          </CardTitle>
          <CardDescription>Your task completion status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completion Rate</span>
              <span className="font-medium">{data.stats.completionRate}%</span>
            </div>
            <Progress value={data.stats.completionRate} className="h-2" />
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{data.stats.pendingTasks}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold">{data.stats.inProgressTasks}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{data.stats.completedTasks}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent and Upcoming Tasks */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Tasks
            </CardTitle>
            <CardDescription>Your latest task activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="mt-1">{getStatusIcon(task.status)}</div>
                <div className="flex-1 space-y-1 min-w-0">
                  <p className="font-medium leading-none truncate">{task.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                      {task.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Tasks
            </CardTitle>
            <CardDescription>Tasks due soon</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="mt-1">{getStatusIcon(task.status)}</div>
                <div className="flex-1 space-y-1 min-w-0">
                  <p className="font-medium leading-none truncate">{task.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                      {task.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Due {formatDate(task.dueDate)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}