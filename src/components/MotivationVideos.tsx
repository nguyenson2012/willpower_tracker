import { useState } from "react";
import { useMotivationVideos } from "@/hooks/useMotivationVideos";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Play, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

const MotivationVideos = () => {
  const { videos, loading, addVideo, deleteVideo, updateVideo } = useMotivationVideos();
  const { isAdmin } = useUserProfile();
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);

  const [newVideo, setNewVideo] = useState({
    title: "",
    video_url: "",
    description: ""
  });

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.title || !newVideo.video_url) {
      toast.error("Title and video URL are required");
      return;
    }

    const result = await addVideo(newVideo);
    if (result) {
      setNewVideo({ title: "", video_url: "", description: "" });
      setShowAddDialog(false);
    }
  };

  const handleUpdateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo || !editingVideo.title || !editingVideo.video_url) {
      toast.error("Title and video URL are required");
      return;
    }

    const result = await updateVideo(editingVideo.id, {
      title: editingVideo.title,
      video_url: editingVideo.video_url,
      description: editingVideo.description
    });
    if (result) {
      setEditingVideo(null);
    }
  };

  const getVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Motivation Videos</h3>
        {isAdmin && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Video
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Motivation Video</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddVideo} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter video title"
                  />
                </div>
                <div>
                  <Label htmlFor="video_url">YouTube URL</Label>
                  <Input
                    id="video_url"
                    value={newVideo.video_url}
                    onChange={(e) => setNewVideo(prev => ({ ...prev, video_url: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={newVideo.description}
                    onChange={(e) => setNewVideo(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter video description"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Video</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {videos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No motivation videos available yet.</p>
            {isAdmin && (
              <p className="text-sm text-muted-foreground mt-2">
                Add some videos to inspire your users!
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {videos.map((video) => {
            const videoId = getVideoId(video.video_url);
            return (
              <Card key={video.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium line-clamp-1">
                      {video.title}
                    </CardTitle>
                    {isAdmin && (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingVideo(video)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteVideo(video.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="relative group">
                    {videoId ? (
                      <div className="relative aspect-video bg-black rounded-md overflow-hidden">
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => setSelectedVideo(videoId)}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors"
                        >
                          <Play className="h-12 w-12 text-white" fill="currentColor" />
                        </button>
                      </div>
                    ) : (
                      <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">Invalid video URL</p>
                      </div>
                    )}
                  </div>
                  {video.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {video.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

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

      {/* Edit Video Dialog */}
      {editingVideo && (
        <Dialog open={!!editingVideo} onOpenChange={() => setEditingVideo(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Motivation Video</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateVideo} className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter video title"
                />
              </div>
              <div>
                <Label htmlFor="edit-video_url">YouTube URL</Label>
                <Input
                  id="edit-video_url"
                  value={editingVideo.video_url}
                  onChange={(e) => setEditingVideo(prev => ({ ...prev, video_url: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description (optional)</Label>
                <Textarea
                  id="edit-description"
                  value={editingVideo.description || ""}
                  onChange={(e) => setEditingVideo(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter video description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingVideo(null)}>
                  Cancel
                </Button>
                <Button type="submit">Update Video</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MotivationVideos;