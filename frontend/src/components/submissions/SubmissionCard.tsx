import { Submission } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar, User, BookOpen } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast";
import { submissionsAPI } from "@/services/api";

interface SubmissionCardProps {
  submission: Submission;
  onDownload?: (submission: Submission) => void;
  showDownloadLogs?: boolean;
}

export function SubmissionCard({ submission, onDownload, showDownloadLogs }: SubmissionCardProps) {
  const { user } = useUser();
  const { toast } = useToast();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canDownload = () => {
    const userRole = user?.publicMetadata?.role as string;
    return userRole === 'admin' || user?.id === submission.authorId;
  };

  const handleDownload = async () => {
    if (!canDownload()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to download this file.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Download Started",
        description: `Downloading ${submission.fileName}...`,
      });

      await submissionsAPI.download(submission.id);

      toast({
        title: "Download Complete",
        description: `${submission.fileName} has been downloaded successfully.`,
      });

      if (onDownload) {
        onDownload(submission);
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download file. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{submission.title}</CardTitle>
        </div>

        {submission.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
            {submission.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Author:</span>
            <span className="font-medium">{submission.author.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Supervisor:</span>
            <span className="font-medium">{submission.supervisor.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Module:</span>
            <span className="font-medium">{submission.module.code}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Submitted:</span>
            <span className="font-medium">
              {new Date(submission.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* File Info */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm">{submission.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(submission.fileSize)}
                </p>
              </div>
            </div>

            {canDownload() && (
              <Button size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            )}
          </div>
        </div>

        {/* Admin-only: Download logs link */}
        {showDownloadLogs && (user?.publicMetadata?.role as string) === 'admin' && (
          <div className="pt-2 border-t">
            <Button variant="ghost" size="sm" className="text-xs">
              View Download Logs ({Math.floor(Math.random() * 10) + 1} downloads)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
