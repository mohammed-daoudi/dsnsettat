import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmissionCard } from "@/components/submissions/SubmissionCard";
import { useUser } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";
import { submissionsAPI, modulesAPI, professorsAPI, ipUsageAPI } from "@/services/api";
import { Search, Filter, Download, Loader2 } from "lucide-react";
import { Submission, Module, Professor } from "@/types";

export default function Submissions() {
  const { user } = useUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [supervisorFilter, setSupervisorFilter] = useState("all");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadStats, setDownloadStats] = useState({ total: 0, active: 0 });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load submissions with role-based filtering
      const filters: any = {};
      if (user?.role === 'student') {
        filters.authorId = user.id;
      } else if (user?.role === 'teacher') {
        filters.supervisorId = user.id;
      }

      const submissionsResponse = await submissionsAPI.getAll(filters);
      setSubmissions(submissionsResponse.submissions || []);

      // Load modules and professors for filters
      const [modulesResponse, professorsResponse] = await Promise.all([
        modulesAPI.getAll(),
        professorsAPI.getAll()
      ]);

      setModules(modulesResponse.modules || []);
      setProfessors(professorsResponse.professors || []);

      // Load real download stats
      try {
        const ipStatsResponse = await ipUsageAPI.getStats();
        setDownloadStats({
          total: ipStatsResponse.totalDownloads || 0,
          active: Math.floor((submissionsResponse.submissions?.length || 0) * 0.8)
        });
      } catch (error) {
        console.error('Error loading download stats:', error);
        // Fallback to 0 if API fails
        setDownloadStats({
          total: 0,
          active: Math.floor((submissionsResponse.submissions?.length || 0) * 0.8)
        });
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load submissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter submissions based on search and filters
  const getFilteredSubmissions = () => {
    let filtered = submissions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.author.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply module filter
    if (moduleFilter !== "all") {
      filtered = filtered.filter(s => s.moduleId === moduleFilter);
    }

    // Apply supervisor filter
    if (supervisorFilter !== "all") {
      filtered = filtered.filter(s => s.supervisorId === supervisorFilter);
    }

    return filtered;
  };

  const filteredSubmissions = getFilteredSubmissions();

  const getPageTitle = () => {
    switch (user?.role) {
      case 'student': return 'My Submissions';
      case 'teacher': return 'Supervised Submissions';
      case 'admin': return 'All Submissions';
      default: return 'Submissions';
    }
  };

  const getPageDescription = () => {
    switch (user?.role) {
      case 'student': return 'View and manage your submitted academic works';
      case 'teacher': return 'Review and manage submissions under your supervision';
      case 'admin': return 'Platform-wide submission management and oversight';
      default: return 'Academic submission management';
    }
  };

  const handleStatusChange = async (submissionId: string, newStatus: string) => {
    try {
      await submissionsAPI.update(submissionId, { status: newStatus });
      toast({
        title: "Status Updated",
        description: "Submission status has been updated successfully.",
      });
      loadData(); // Reload data
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update submission status.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (submission: Submission) => {
    // This is handled by the SubmissionCard component now
    console.log(`Download triggered for: ${submission.title}`);
  };

  const handleView = (submission: Submission) => {
    // View logic here
    console.log(`Viewing submission: ${submission.title}`);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
        <p className="text-muted-foreground">{getPageDescription()}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{submissions.length}</div>
              <div className="text-sm text-muted-foreground">Total Submissions</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {downloadStats.total}
              </div>
              <div className="text-sm text-muted-foreground">Downloads</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {downloadStats.active}
              </div>
              <div className="text-sm text-muted-foreground">Active Works</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search through submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Module Filter */}
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Supervisor Filter (for admin/teacher) */}
            {(user?.role === 'admin' || user?.role === 'teacher') && (
              <Select value={supervisorFilter} onValueChange={setSupervisorFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Supervisor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Supervisors</SelectItem>
                  {professors.map((professor) => (
                    <SelectItem key={professor.id} value={professor.id}>
                      {professor.name.replace('Prof. ', '')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setModuleFilter("all");
                setSupervisorFilter("all");
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {filteredSubmissions.length} Submission{filteredSubmissions.length !== 1 ? 's' : ''}
          </h2>

          {user?.role === 'admin' && filteredSubmissions.length > 0 && (
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          )}
        </div>

        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-4">
                  {submissions.length === 0
                    ? "No submissions found."
                    : "No submissions found matching your criteria."}
                </div>
                {submissions.length > 0 && (
                  <Button variant="outline" onClick={() => {
                    setSearchTerm("");
                    setModuleFilter("all");
                    setSupervisorFilter("all");
                  }}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSubmissions.map((submission) => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                onDownload={handleDownload}
                showDownloadLogs={user?.role === 'admin'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
