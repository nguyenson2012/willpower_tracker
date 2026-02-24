import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Clock, ExternalLink, Eye } from "lucide-react";
import { useUserSubmittedVideos, UserSubmittedVideo } from "@/hooks/useUserSubmittedVideos";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'approved':
      return <CheckCircle className="h-4 w-4" />;
    case 'rejected':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getVideoId = (url: string) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

interface UserSubmittedVideosListProps {
  videos: UserSubmittedVideo[];
}

export const UserSubmittedVideosList = ({ videos }: UserSubmittedVideosListProps) => {
  if (videos.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="space-y-2">
          <div className="text-3xl">📹</div>
          <h3 className="text-lg font-semibold">No submitted videos yet</h3>
          <p className="text-sm text-muted-foreground">
            Submit your first motivation video for review!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {videos.map((video) => {
        const videoId = getVideoId(video.video_url);
        const statusColor = getStatusColor(video.status);
        
        return (
          <Card key={video.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base line-clamp-2 mb-2">
                    {video.title}
                  </CardTitle>
                  {video.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {video.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <Badge className={`${statusColor} border`}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(video.status)}
                      <span className="capitalize">{video.status}</span>
                    </span>
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(video.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {video.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800">Under Review</p>
                      <p className="text-yellow-700">
                        Your video is being reviewed by our admin team. We'll notify you once it's processed.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {video.status === 'approved' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-green-800">Approved!</p>
                      <p className="text-green-700">
                        Your video has been approved and is now live in the video discovery section.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {video.status === 'rejected' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-red-800">Not Approved</p>
                      <p className="text-red-700 mb-2">
                        Unfortunately, your video submission was not approved.
                      </p>
                      {video.rejection_reason && (
                        <p className="text-red-700">
                          <span className="font-medium">Reason:</span> {video.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                {videoId && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>{video.title}</DialogTitle>
                      </DialogHeader>
                      <div className="aspect-video">
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}`}
                          title={video.title}
                          className="w-full h-full rounded-md"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(video.video_url, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};