import { useState } from "react";
import { useMotivationVideos } from "@/hooks/useMotivationVideos";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit, Eye, EyeOff, ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Navigate } from "react-router-dom";

const AdminVideos = () => {
  const { user } = useAuth();
  const { isAdmin, loading: profileLoading } = useUserProfile();
  const { videos, loading, addVideo, deleteVideo, updateVideo } = useMotivationVideos();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);

  const [newVideo, setNewVideo] = useState({
    title: "",
    video_url: "",
    description: ""
  });

  // Redirect if not admin
  if (!profileLoading && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

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

  const toggleVideoStatus = async (video: any) => {
    await updateVideo(video.id, { is_active: !video.is_active });
  };

  const getVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎬</span>
              <h1 className="text-xl font-bold font-display text-foreground">Video Management</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
              Admin Panel
            </Badge>
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Motivation Videos</h2>
            <p className="text-muted-foreground">Manage inspiration videos for all users</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Video
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Video</DialogTitle>
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
        </div>

        {videos.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first motivation video to inspire users.
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Video
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Videos ({videos.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Video</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videos.map((video) => {
                    const videoId = getVideoId(video.video_url);
                    return (
                      <TableRow key={video.id}>
                        <TableCell>
                          {videoId ? (
                            <img
                              src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                              alt={video.title}
                              className="w-20 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-20 h-12 bg-muted rounded flex items-center justify-center text-xs">
                              No preview
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{video.title}</p>
                            {video.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {video.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={video.is_active ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => toggleVideoStatus(video)}
                          >
                            {video.is_active ? (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                Hidden
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(video.created_at), 'MMM dd, yyyy')}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(video.video_url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
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
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this video?')) {
                                  deleteVideo(video.id);
                                }
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Edit Video Dialog */}
        {editingVideo && (
          <Dialog open={!!editingVideo} onOpenChange={() => setEditingVideo(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Video</DialogTitle>
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
      </main>
    </div>
  );
};

export default AdminVideos;