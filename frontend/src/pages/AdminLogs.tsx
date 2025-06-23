import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Eye, Calendar, MapPin } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { ipUsageAPI, submissionsAPI } from "@/services/api";

interface AccessLog {
  id: string;
  timestamp: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  submissionId: string;
  submission?: {
    id: string;
    title: string;
  };
  accessType: 'download' | 'view';
  ipAddress: string;
  userAgent: string;
  purpose: string;
  status: 'success' | 'failed' | 'pending';
  approved: boolean;
}

export default function AdminLogs() {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [accessTypeFilter, setAccessTypeFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uniqueUsers, setUniqueUsers] = useState<{id: string, email: string}[]>([]);

  // Fetch logs from API
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await ipUsageAPI.getAll({
          page: 1,
          limit: 100, // Adjust based on your pagination needs
        });

        const logsData = response.data || [];
        setLogs(logsData);

        // Extract unique users
        const usersMap = new Map();
        logsData.forEach((log: AccessLog) => {
          if (log.user && !usersMap.has(log.user.id)) {
            usersMap.set(log.user.id, {
              id: log.user.id,
              email: log.user.email
            });
          }
        });
        setUniqueUsers(Array.from(usersMap.values()));

      } catch (err) {
        console.error('Error fetching logs:', err);
        setError('Failed to load logs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if ((user?.publicMetadata?.role as string) === 'admin') {
      fetchLogs();
    }
  }, [user]);

  const getFilteredLogs = () => {
    let filtered = [...logs];

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.submission?.title?.toLowerCase().includes(term) ||
          log.user?.email?.toLowerCase().includes(term) ||
          log.ipAddress?.toLowerCase().includes(term) ||
          log.purpose?.toLowerCase().includes(term)
      );
    }

    // Apply access type filter
    if (accessTypeFilter !== 'all') {
      filtered = filtered.filter((log) => log.accessType === accessTypeFilter);
    }

    // Apply user filter
    if (userFilter !== 'all') {
      filtered = filtered.filter((log) => log.user?.id === userFilter);
    }

    return filtered.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const filteredLogs = getFilteredLogs();

  const formatDateTime = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(date));
  };

  const getBrowserFromUserAgent = (userAgent: string) => {
    if (!userAgent) return 'Unknown';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Other';
  };

  const getAccessTypeIcon = (type: string) => {
    return type === 'download' ? <Download className="h-4 w-4" /> : <Eye className="h-4 w-4" />;
  };

  const getAccessTypeColor = (type: string) => {
    return type === 'download'
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Only allow admin access
  if ((user?.publicMetadata?.role as string) !== 'admin') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">You don't have permission to view download logs.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }


  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4"
                variant="outline"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Download Logs</h1>
        <p className="text-muted-foreground">Track all file access and download activities across the platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{filteredLogs.length}</div>
              <div className="text-sm text-muted-foreground">Total Logs</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredLogs.filter(l => l.accessType === 'download').length}
              </div>
              <div className="text-sm text-muted-foreground">Downloads</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {filteredLogs.filter(l => l.accessType === 'view').length}
              </div>
              <div className="text-sm text-muted-foreground">Views</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {new Set(filteredLogs.map(l => l.userId)).size}
              </div>
              <div className="text-sm text-muted-foreground">Unique Users</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search through access logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, IP address, or purpose..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Access Type Filter */}
            <Select value={accessTypeFilter} onValueChange={setAccessTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Access Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="download">Downloads</SelectItem>
                <SelectItem value="view">Views</SelectItem>
              </SelectContent>
            </Select>

            {/* User Filter */}
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map((user) => (
                  <SelectItem key={user?.id} value={user?.id || ''}>
                    {user?.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setAccessTypeFilter("all");
                setUserFilter("all");
              }}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Access Logs</CardTitle>
          <CardDescription>
            Detailed log of all file access activities - {filteredLogs.length} records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No logs found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Submission</TableHead>
                    <TableHead>Access Type</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Browser</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDateTime(log.timestamp)}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>
                          <div className="font-medium">{log.user.name}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {log.user.email}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="max-w-xs">
                          <div className="font-medium truncate">
                            {log.submission?.title || 'Unknown Submission'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {log.submissionId}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge className={getAccessTypeColor(log.accessType)}>
                          <div className="flex items-center gap-1">
                            {getAccessTypeIcon(log.accessType)}
                            <span className="capitalize">{log.accessType}</span>
                          </div>
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm">{log.ipAddress}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm">
                          {getBrowserFromUserAgent(log.userAgent)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm">
                          {log.purpose || 'Not specified'}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Badge variant={log.approved ? 'default' : 'destructive'}>
                          {log.approved ? 'Approved' : 'Denied'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
