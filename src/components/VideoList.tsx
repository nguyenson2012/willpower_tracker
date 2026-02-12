import { useState, useMemo } from "react";
import { useMotivationVideos } from "@/hooks/useMotivationVideos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, ExternalLink, Grid3X3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VideoList = () => {
  const { videos, loading } = useMotivationVideos();
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  
  const DISPLAY_COUNT = 3;

  // Get 3 random videos, memoized to prevent reshuffling on re-renders
  const randomVideos = useMemo(() => {
    if (videos.length <= DISPLAY_COUNT) return videos;
    
    // Create a copy and shuffle
    const shuffled = [...videos];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, DISPLAY_COUNT);
  }, [videos]);

  const getVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  if (loading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">🎬</span>
            Videos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">🎬</span>
              Videos
            </CardTitle>
            <div className="flex items-center gap-2">
              {videos.length > DISPLAY_COUNT && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/videos')}
                  className="text-xs"
                >
                  <Grid3X3 className="h-3 w-3 mr-1" />
                  View All ({videos.length})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
            {randomVideos.map((video, index) => {
              const videoId = getVideoId(video.video_url);
              return (
                <div
                  key={video.id}
                  className="flex items-center justify-between p-3 rounded-lg border transition-all duration-200 group hover:bg-muted/50 border-border"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {videoId && (
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-16 h-9 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm line-clamp-1 transition-colors group-hover:text-primary">
                        {video.title}
                      </p>
                      {video.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    {videoId && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedVideo(videoId)}
                        className="h-8 w-8 p-0"
                      >
                        <Play className="h-3 w-3" fill="currentColor" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(video.video_url, '_blank')}
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Discovery hint */}
          {videos.length > DISPLAY_COUNT && (
            <div className="text-center mt-3">
              <p className="text-xs text-muted-foreground">
                Showing 3 random videos • <button 
                  onClick={() => navigate('/videos')}
                  className="text-primary hover:underline"
                >
                  Discover all {videos.length} videos
                </button>
              </p>
            </div>
          )}
          
          {/* Simple count for few videos */}
          {videos.length <= DISPLAY_COUNT && videos.length > 1 && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              {videos.length} motivation videos available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Video Player Dialog */}
      {selectedVideo && (
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Motivation Video</DialogTitle>
            </DialogHeader>
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                title="Motivation Video"
                className="w-full h-full rounded-md"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default VideoList;