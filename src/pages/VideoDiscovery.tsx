import { useState, useMemo } from "react";
import { useMotivationVideos } from "@/hooks/useMotivationVideos";
import { useUserSubmittedVideos } from "@/hooks/useUserSubmittedVideos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, ExternalLink, ArrowLeft, Search, Grid3X3, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SubmitVideoDialog } from "@/components/SubmitVideoDialog";
import { UserSubmittedVideosList } from "@/components/UserSubmittedVideosList";
import { useAuth } from "@/hooks/useAuth";

const VideoDiscovery = () => {
  const { videos, loading } = useMotivationVideos();
  const { userVideos, loading: userVideosLoading } = useUserSubmittedVideos();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("discover");

  const getVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Filter videos based on search query
  const filteredVideos = useMemo(() => {
    if (!searchQuery.trim()) return videos;
    
    const query = searchQuery.toLowerCase();
    return videos.filter(video => 
      video.title.toLowerCase().includes(query) ||
      (video.description && video.description.toLowerCase().includes(query))
    );
  }, [videos, searchQuery]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-64 animate-pulse">
                <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            {user && (
              <SubmitVideoDialog>
                <Button className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Submit Video
                </Button>
              </SubmitVideoDialog>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="discover">Discover Videos</TabsTrigger>
              <TabsTrigger value="my-submissions">My Submissions {userVideos.length > 0 && `(${userVideos.length})`}</TabsTrigger>
            </TabsList>

            <TabsContent value="discover" className="space-y-6">
              {/* Search */}
              <div>
                <div className="relative max-w-md">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {searchQuery && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Found {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''} matching "{searchQuery}"
                    {filteredVideos.length !== videos.length && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchQuery("")}
                        className="ml-2 h-auto p-0 text-primary hover:underline"
                      >
                        Clear
                      </Button>
                    )}
                  </p>
                )}
              </div>

              {/* Video Grid */}
              {filteredVideos.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="text-4xl">🔍</div>
                    {searchQuery ? (
                      <>
                        <h2 className="text-xl font-semibold">No videos found</h2>
                        <p className="text-muted-foreground">
                          Try adjusting your search terms or{' '}
                          <Button
                            variant="link"
                            onClick={() => setSearchQuery("")}
                            className="p-0 h-auto"
                          >
                            clear the search
                          </Button>
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 className="text-xl font-semibold">No videos available</h2>
                        <p className="text-muted-foreground">
                          Check back later for new motivation videos!
                        </p>
                      </>
                    )}
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVideos.map((video) => {
                    const videoId = getVideoId(video.video_url);
                    return (
                      <Card key={video.id} className="group hover:shadow-lg transition-all duration-200">
                        <CardHeader className="p-0">
                          <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                            {videoId ? (
                              <>
                                <img
                                  src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                  alt={video.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                  <Button
                                    size="lg"
                                    className="rounded-full bg-white/90 text-black hover:bg-white hover:scale-110 transition-all duration-200"
                                    onClick={() => setSelectedVideo(videoId)}
                                  >
                                    <Play className="h-6 w-6" fill="currentColor" />
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                <div className="text-muted-foreground text-4xl">🎬</div>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <CardTitle className="text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                            {video.title}
                          </CardTitle>
                          {video.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {video.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {videoId && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedVideo(videoId)}
                                >
                                  <Play className="h-3 w-3 mr-1" fill="currentColor" />
                                  Watch
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => window.open(video.video_url, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-submissions" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">My Video Submissions</h2>
                  <p className="text-sm text-muted-foreground">
                    Track the status of your submitted videos
                  </p>
                </div>
                <SubmitVideoDialog>
                  <Button size="sm" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Submit Another
                  </Button>
                </SubmitVideoDialog>
              </div>
              
              {userVideosLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i} className="p-4">
                      <div className="animate-pulse space-y-3">
                        <div className="flex justify-between">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-6 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <UserSubmittedVideosList videos={userVideos} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

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

export default VideoDiscovery;