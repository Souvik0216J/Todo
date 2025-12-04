'use client'
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { CheckCircle2, Circle, Clock, TrendingUp, ListTodo, AlertCircle, Calendar, BarChart3, RefreshCw, Plus, Edit2, Trash2, MoreVertical, User, LogOut, Moon, Sun } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from "next/navigation";

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

interface TaskFormData {
  description: string;
  status: string;
  priority: string;
  dueDate: string;
}

interface UserData {
  name: string;
  email: string;
  createdAt: string;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [recentFilter, setRecentFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    createdAt: '',
  });

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  // Form state
  const [formData, setFormData] = useState<TaskFormData>({
    description: '',
    status: 'pending',
    priority: 'low',
    dueDate: '',
  });

  useEffect(() => {
    fetchDashboardData();
    fetchUserData();
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLogout = async () => {
    try {
      await axios.get("/api/users/logout")
      toast.success("Logout successful")
      router.push("/")
      router.refresh();
    } catch (error: any) {
      toast.error(error.message)
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/api/users/me', {
        withCredentials: true,
      });

      if (response.data.success) {
        setUserData({
          name: response.data.user.name || 'User',
          email: response.data.user.email || '',
          createdAt: response.data.user.createdAt,
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch user data:', err);
      // Set default values if fetch fails
      setUserData({
        name: 'User',
        email: 'user@example.com',
        createdAt: "",
      });
    }
  };

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await axios.get('/api/users/dashboard', {
        withCredentials: true,
      });

      if (response.data.success) {
        setData(response.data);
        if (isRefresh) {
          toast.success('Dashboard refreshed successfully');
        }
      } else {
        throw new Error(response.data.error || 'Failed to load dashboard');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      toast.error('Failed to load dashboard', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateLocalData = (updatedTask: Task, action: 'add' | 'update' | 'delete') => {
    if (!data) return;

    let newRecentTasks = [...data.recentTasks];
    let newUpcomingTasks = [...data.upcomingTasks];
    let newStats = { ...data.stats };

    // Get current task if exists for accurate stat updates
    const existingRecentTask = newRecentTasks.find(t => t.id === updatedTask.id);
    const existingUpcomingTask = newUpcomingTasks.find(t => t.id === updatedTask.id);
    const existingTask = existingRecentTask || existingUpcomingTask;

    if (action === 'add') {
      newRecentTasks.unshift(updatedTask);
      // if (newRecentTasks.length > 5) newRecentTasks.pop();

      // Add to upcoming tasks if it has a due date and is not completed
      if (updatedTask.dueDate && updatedTask.status !== 'completed') {
        newUpcomingTasks.unshift(updatedTask);
        // Sort by due date
        newUpcomingTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        if (newUpcomingTasks.length > 5) newUpcomingTasks.pop();
      }

      newStats.totalTasks++;
      if (updatedTask.status === 'completed') newStats.completedTasks++;
      else if (updatedTask.status === 'in-progress') newStats.inProgressTasks++;
      else newStats.pendingTasks++;

      // Check if overdue
      if (isOverdue(updatedTask.dueDate, updatedTask.status)) {
        newStats.overdueTasks++;
      }
    } else if (action === 'update') {
      newRecentTasks = newRecentTasks.map(t => t.id === updatedTask.id ? updatedTask : t);
      newUpcomingTasks = newUpcomingTasks.map(t => t.id === updatedTask.id ? updatedTask : t);

      // Update stats if status changed
      if (existingTask && existingTask.status !== updatedTask.status) {
        // Decrease old status count
        if (existingTask.status === 'completed') newStats.completedTasks--;
        else if (existingTask.status === 'in-progress') newStats.inProgressTasks--;
        else newStats.pendingTasks--;

        // Increase new status count
        if (updatedTask.status === 'completed') newStats.completedTasks++;
        else if (updatedTask.status === 'in-progress') newStats.inProgressTasks++;
        else newStats.pendingTasks++;
      }

      // Recalculate overdue count
      if (existingTask) {
        const wasOverdue = isOverdue(existingTask.dueDate, existingTask.status);
        const isNowOverdue = isOverdue(updatedTask.dueDate, updatedTask.status);

        if (wasOverdue && !isNowOverdue) newStats.overdueTasks--;
        else if (!wasOverdue && isNowOverdue) newStats.overdueTasks++;
      }
    } else if (action === 'delete') {
      newRecentTasks = newRecentTasks.filter(t => t.id !== updatedTask.id);
      newUpcomingTasks = newUpcomingTasks.filter(t => t.id !== updatedTask.id);

      newStats.totalTasks--;
      if (updatedTask.status === 'completed') newStats.completedTasks--;
      else if (updatedTask.status === 'in-progress') newStats.inProgressTasks--;
      else newStats.pendingTasks--;

      // Decrease overdue count if task was overdue
      if (isOverdue(updatedTask.dueDate, updatedTask.status)) {
        newStats.overdueTasks--;
      }
    }

    newStats.completionRate = newStats.totalTasks > 0
      ? Math.round((newStats.completedTasks / newStats.totalTasks) * 100)
      : 0;

    setData({
      stats: newStats,
      recentTasks: newRecentTasks,
      upcomingTasks: newUpcomingTasks,
    });
  };

  const handleAddTask = async () => {
    if (!formData.description.trim()) {
      toast.error('Please enter a task description');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.post('/api/users/tasks', {
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate,
      }, {
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success('Task added successfully');
        setIsAddDialogOpen(false);
        resetForm();

        // Update local data without reload
        if (response.data.task && response.data.task.id) {
          const newTask: Task = {
            id: response.data.task.id,
            title: formData.description.substring(0, 50),
            description: formData.description,
            status: formData.status as any,
            priority: formData.priority as any,
            dueDate: formData.dueDate,
            createdAt: response.data.task.createdAt || new Date().toISOString(),
          };
          updateLocalData(newTask, 'add');
        } else {
          // If no ID in response refresh the dashboard to get accurate data
          fetchDashboardData(true);
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to add task';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask || !formData.description.trim()) {
      toast.error('Please enter a task description');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axios.put(`/api/users/tasks/${selectedTask.id}`, {
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate,
      }, {
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success('Task updated successfully');
        setIsEditDialogOpen(false);

        // Update local data without reload
        const updatedTask: Task = {
          ...selectedTask,
          title: formData.description.substring(0, 50),
          description: formData.description,
          status: formData.status as any,
          priority: formData.priority as any,
          dueDate: formData.dueDate,
        };
        updateLocalData(updatedTask, 'update');

        setSelectedTask(null);
        resetForm();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to update task';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    try {
      setIsSubmitting(true);
      const response = await axios.delete(`/api/users/tasks/${selectedTask.id}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success('Task deleted successfully');
        setIsDeleteDialogOpen(false);

        // Update local data without reload
        updateLocalData(selectedTask, 'delete');

        setSelectedTask(null);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to delete task';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (task: Task, newStatus: string) => {
    try {
      const response = await axios.patch(`/api/users/tasks/${task.id}/status`, {
        status: newStatus,
      }, {
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success('Status updated successfully');

        // Update local data without reload
        const updatedTask = { ...task, status: newStatus as any };
        updateLocalData(updatedTask, 'update');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to update status';
      toast.error(errorMessage);
    }
  };

  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      description: '',
      status: 'pending',
      priority: 'low',
      dueDate: '',
    });
  };

  const getProgressBarColor = (rate: number) => {
    if (rate < 25) return 'bg-red-500';
    if (rate < 50) return 'bg-orange-500';
    if (rate < 75) return 'bg-yellow-500';
    if (rate < 90) return 'bg-lime-500';
    return 'bg-green-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';;
      case 'medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case 'in-progress':
        return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const formatDateAvtar = (dateString: string) => {
    if (!dateString) return "No date";

    // format is "3/12/2025"
    const [datePart] = dateString.split(",");
    const [day, month, year] = datePart.split("/").map(Number);

    // Create a proper JS date using yyyy, mm-1, dd
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  };

  const formatDate = (dateString: string) => { if (!dateString) return 'No date'; const date = new Date(dateString); return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };

  const isOverdue = (dueDate: string, status: string) => {
    if (!dueDate || status === 'completed') return false;
    const due = new Date(dueDate);
    const now = new Date();
    return due < now;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
      <div
        className="mt-1 cursor-pointer"
        onClick={() => {
          const nextStatus = task.status === 'pending' ? 'in-progress' :
            task.status === 'in-progress' ? 'completed' : 'pending';
          handleQuickStatusChange(task, nextStatus);
        }}
      >
        {getStatusIcon(task.status)}
      </div>
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-start justify-between gap-2 w-full">
          <p className="font-medium leading-tight wrap-break-word line-clamp-2 flex-1 min-w-0">{task.title}</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleQuickStatusChange(task, 'pending')}>
                <Circle className="mr-2 h-4 w-4" />
                Mark as Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleQuickStatusChange(task, 'in-progress')}>
                <Clock className="mr-2 h-4 w-4" />
                Mark as In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleQuickStatusChange(task, 'completed')}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as Completed
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openEditDialog(task)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteDialog(task)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p> */}
        <div className="flex items-center gap-2 flex-wrap">
          {getStatusBadge(task.status)}
          <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </Badge>
          {task.dueDate && (
            <span
              className={`text-xs ${isOverdue(task.dueDate, task.status) ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}
            >
              {isOverdue(task.dueDate, task.status) && '⚠️ '}
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
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

  if (error && !data) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error Loading Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchDashboardData()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const filteredRecentTasks = data.recentTasks.filter((task) =>
    recentFilter === 'all' ? true : task.status === recentFilter
  );

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back {userData.name}, Here's your task overview.</p>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              onClick={() => fetchDashboardData(true)}
              variant="outline"
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>

            {/* User Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt={userData.name} />
                    <AvatarFallback>{getInitials(userData.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userData.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userData.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground pt-2">
                      Joined: {formatDateAvtar(userData.createdAt)}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleTheme}>
                  {theme === 'light' ? (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      Dark Mode
                    </>
                  ) : (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      Light Mode
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full ${getProgressBarColor(data.stats.completionRate)} transition-all duration-500`}
                  style={{ width: `${data.stats.completionRate}%` }}
                />
              </div>
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Recent Tasks
                  </CardTitle>
                  <CardDescription>Your latest task activity</CardDescription>
                </div>

                <Select
                  value={recentFilter}
                  onValueChange={(value) =>
                    setRecentFilter(value as 'all' | 'pending' | 'in-progress' | 'completed')
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[500px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:hover:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-600">
              {filteredRecentTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recent tasks found
                </p>
              ) : (
                filteredRecentTasks.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Tasks
              </CardTitle>
              <CardDescription>Tasks due soon</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.upcomingTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No upcoming tasks
                </p>
              ) : (
                data.upcomingTasks.map((task) => <TaskCard key={task.id} task={task} />)
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Create a new task to track your work.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Enter task description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAddTask} disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update your task details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                placeholder="Enter task description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dueDate">Due Date</Label>
              <Input
                id="edit-dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTask} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground wrap-break-word">
                <strong>Task:</strong> {selectedTask.description}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTask} disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Delete Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}