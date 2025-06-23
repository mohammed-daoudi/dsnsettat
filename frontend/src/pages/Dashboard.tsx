import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { submissionsAPI, usersAPI, ipUsageAPI } from "@/services/api";
import { FileText, Upload, Users, BarChart3, TrendingUp, Clock, Loader2 } from "lucide-react";
import { Submission } from "@/types";

export default function Dashboard() {
  const { user } = useUser();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    totalDownloads: 0,
    recentSubmissions: 0,
    modulesCovered: 0,
    studentsCount: 0,
    totalUsers: 0,
    systemAlerts: 0,
  });
  const [loading, setLoading] = useState(true);

  // Define a type for submission filters for better type safety
  type SubmissionFilters = {
    authorId?: string;
    supervisorId?: string;
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const userRole = user?.publicMetadata?.role as string;

      // Load submissions with role-based filtering
      const filters: SubmissionFilters = {};
      if (userRole === 'student') {
        filters.authorId = user.id;
      } else if (userRole === 'teacher') {
        filters.supervisorId = user.id;
      }

      const submissionsResponse = await submissionsAPI.getAll(filters);
      const submissionsData = submissionsResponse.submissions || [];
      setSubmissions(submissionsData);

      // Calculate stats based on user role
      const calculatedStats = {
        totalSubmissions: submissionsData.length,
        totalDownloads: 0,
        recentSubmissions: 0,
        modulesCovered: 0,
        studentsCount: 0,
        totalUsers: 0,
        systemAlerts: 0,
      };

      if (userRole === 'student') {
        calculatedStats.modulesCovered = new Set(submissionsData.map(s => s.moduleId)).size;
        calculatedStats.recentSubmissions = submissionsData.filter(s =>
          new Date(s.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length;
      } else if (userRole === 'teacher') {
        calculatedStats.studentsCount = new Set(submissionsData.map(s => s.authorId)).size;
        calculatedStats.recentSubmissions = submissionsData.filter(s =>
          new Date(s.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length;
      } else if (userRole === 'admin') {
        // Load additional admin stats
        try {
          const [usersResponse, ipStatsResponse] = await Promise.all([
            usersAPI.getAll(),
            ipUsageAPI.getStats()
          ]);

          calculatedStats.totalUsers = usersResponse.users?.length || 0;
          calculatedStats.totalDownloads = ipStatsResponse.totalDownloads || 0;
        } catch (error) {
          console.error('Error loading admin stats:', error);
        }
      }

      // Load real download stats for all users
      try {
        const ipStatsResponse = await ipUsageAPI.getStats();
        calculatedStats.totalDownloads = ipStatsResponse.totalDownloads || 0;
      } catch (error) {
        console.error('Error loading download stats:', error);
        // Fallback to 0 if API fails
        calculatedStats.totalDownloads = 0;
      }

      setStats(calculatedStats);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const getRecentSubmissions = () => {
    const userRole = user?.publicMetadata?.role as string;
    if (userRole === 'student') {
      return submissions.filter(s => s.authorId === user.id).slice(0, 3);
    } else if (userRole === 'teacher') {
      return submissions.filter(s => s.supervisorId === user.id).slice(0, 3);
    } else {
      return submissions.slice(0, 5);
    }
  };

  const recentSubmissions = getRecentSubmissions();

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const renderStudentDashboard = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">Academic works submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Works</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.recentSubmissions}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modules</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.modulesCovered}</div>
            <p className="text-xs text-muted-foreground">Modules covered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDownloads}</div>
            <p className="text-xs text-muted-foreground">Times downloaded</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Submit New Work
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              View My Submissions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTeacherDashboard = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supervised Works</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">Under your supervision</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Submissions</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.recentSubmissions}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.studentsCount}</div>
            <p className="text-xs text-muted-foreground">Active students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDownloads}</div>
            <p className="text-xs text-muted-foreground">Total access logs</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">Platform-wide submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDownloads}</div>
            <p className="text-xs text-muted-foreground">File downloads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
            <BarChart3 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.systemAlerts}</div>
            <p className="text-xs text-muted-foreground">Active alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      {recentSubmissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Latest academic works submitted to the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{submission.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      by {submission.author.name} • {new Date(submission.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.fullName || user?.firstName}! Here's what's happening with your academic works.
        </p>
      </div>

      {/* Role-based dashboard content */}
      {(user?.publicMetadata?.role as string) === 'student' && renderStudentDashboard()}
      {(user?.publicMetadata?.role as string) === 'teacher' && renderTeacherDashboard()}
      {(user?.publicMetadata?.role as string) === 'admin' && renderAdminDashboard()}
    </div>
  );
}
