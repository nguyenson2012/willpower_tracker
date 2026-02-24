import { useState } from "react";
import { useMotivationVideos } from "@/hooks/useMotivationVideos";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAdminSubmissionReview } from "@/hooks/useAdminSubmissionReview";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit, Eye, EyeOff, ArrowLeft, ExternalLink, Clock, CheckCircle, XCircle, Play } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Navigate } from "react-router-dom";

const AdminVideos = () => {
  const { user } = useAuth();
  const { isAdmin, loading: profileLoading } = useUserProfile();
  const { videos, loading, addVideo, deleteVideo, updateVideo, checkForDuplicate } = useMotivationVideos();
  const { pendingVideos, allSubmissions, loading: submissionsLoading, approveVideo, rejectVideo } = useAdminSubmissionReview();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);

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

    setIsCheckingDuplicate(true);
    
    try {
      // Check for duplicates before adding
      const isDuplicate = await checkForDuplicate(newVideo.video_url);
      
      if (isDuplicate) {
        // Show confirmation dialog for duplicate
        const confirmAdd = window.confirm(
          "⚠️ Warning: This video appears to already exist in the motivation videos list.\n\nDo you still want to add it?"
        );
        
        if (!confirmAdd) {
          setIsCheckingDuplicate(false);
          return;
        }
      }
      
      const result = await addVideo(newVideo);
      if (result) {
        setNewVideo({ title: "", video_url: "", description: "" });
        setShowAddDialog(false);
      }
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const handleUpdateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo || !editingVideo.title || !editingVideo.video_url) {
      toast.error("Title and video URL are required");
      return;
    }

    setIsCheckingDuplicate(true);
    
    try {
      // Check for duplicates if URL was changed
      const originalVideo = videos.find(v => v.id === editingVideo.id);
      if (originalVideo && originalVideo.video_url !== editingVideo.video_url) {
        const isDuplicate = await checkForDuplicate(editingVideo.video_url, editingVideo.id);
        
        if (isDuplicate) {
          const confirmUpdate = window.confirm(
            "⚠️ Warning: This video URL appears to already exist in the motivation videos list.\n\nDo you still want to update it?"
          );
          
          if (!confirmUpdate) {
            setIsCheckingDuplicate(false);
            return;
          }
        }
      }

      const result = await updateVideo(editingVideo.id, {
        title: editingVideo.title,
        video_url: editingVideo.video_url,
        description: editingVideo.description
      });
      if (result) {
        setEditingVideo(null);
      }
    } finally {
      setIsCheckingDuplicate(false);
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

  const handleApproveVideo = async (submissionId: string) => {
    try {
      await approveVideo(submissionId);
      toast.success("Video approved successfully!");
    } catch (error) {
      console.error("Error approving video:", error);
      toast.error("Failed to approve video");
    }
  };

  const handleRejectVideo = async (submissionId: string, reason: string) => {
    try {
      await rejectVideo(submissionId, reason.trim() || undefined);
      toast.success("Video rejected");
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting video:", error);
      toast.error("Failed to reject video");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
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
        <Tabs defaultValue="videos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="videos">Video Management</TabsTrigger>
            <TabsTrigger value="submissions">
              User Submissions {pendingVideos.length > 0 && `(${pendingVideos.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="space-y-6">
            <div className="flex items-center justify-between">
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
                      <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)} disabled={isCheckingDuplicate}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isCheckingDuplicate}>
                        {isCheckingDuplicate ? "Checking..." : "Add Video"}
                      </Button>
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
                              <div className="flex items-center gap-2">
                                {videoId && (
                                  <img
                                    src={`https://img.youtube.com/vi/${videoId}/default.jpg`}
                                    alt={video.title}
                                    className="w-16 h-12 object-cover rounded"
                                  />
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(video.video_url, '_blank')}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{video.title}</div>
                                {video.description && (
                                  <div className="text-sm text-muted-foreground line-clamp-1">
                                    {video.description}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={video.is_active ? "default" : "secondary"}>
                                {video.is_active ? (
                                  <><Eye className="h-3 w-3 mr-1" /> Active</>
                                ) : (
                                  <><EyeOff className="h-3 w-3 mr-1" /> Inactive</>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>{format(new Date(video.created_at), "MMM d, yyyy")}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleVideoStatus(video)}
                                  title={video.is_active ? "Deactivate" : "Activate"}
                                >
                                  {video.is_active ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingVideo(video)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteVideo(video.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
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
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">User Video Submissions</h2>
                <p className="text-muted-foreground">
                  Review and approve user-submitted motivation videos
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-yellow-50">
                  {pendingVideos.length} Pending Review
                </Badge>
              </div>
            </div>

            {submissionsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : allSubmissions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">📹</div>
                  <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                  <p className="text-muted-foreground">
                    User video submissions will appear here for review.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingVideos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-yellow-700">
                      🕐 Pending Review ({pendingVideos.length})
                    </h3>
                    <div className="space-y-4">
                      {pendingVideos.map((submission) => {
                        const videoId = getVideoId(submission.video_url);
                        return (
                          <Card key={submission.id} className="border-yellow-200 bg-yellow-50/30">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-semibold text-lg">{submission.title}</h4>
                                    <Badge className={getStatusColor(submission.status)}>
                                      {getStatusIcon(submission.status)}
                                      <span className="ml-1 capitalize">{submission.status}</span>
                                    </Badge>
                                  </div>
                                  {submission.description && (
                                    <p className="text-muted-foreground mb-3">{submission.description}</p>
                                  )}
                                  <div className="text-sm text-muted-foreground mb-4">
                                    Submitted on {format(new Date(submission.created_at), "MMM d, yyyy 'at' h:mm a")}
                                  </div>
                                  
                                  <div className="flex items-center gap-2 mb-4">
                                    {videoId && (
                                      <>
                                        <img
                                          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                          alt={submission.title}
                                          className="w-32 h-24 object-cover rounded"
                                        />
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                              <Play className="h-4 w-4 mr-2" />
                                              Preview
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="max-w-4xl">
                                            <DialogHeader>
                                              <DialogTitle>{submission.title}</DialogTitle>
                                            </DialogHeader>
                                            <div className="aspect-video">
                                              <iframe
                                                src={`https://www.youtube.com/embed/${videoId}`}
                                                title={submission.title}
                                                className="w-full h-full rounded-md"
                                                allowFullScreen
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                              />
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                      </>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => window.open(submission.video_url, '_blank')}
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Button
                                      onClick={() => handleApproveVideo(submission.id)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </Button>
                                    
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="destructive">
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Reject
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Reject Video Submission</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to reject "{submission.title}"? You can provide a reason for the user.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <div className="py-4">
                                          <Label htmlFor="rejection-reason">Rejection Reason (Optional)</Label>
                                          <Textarea
                                            id="rejection-reason"
                                            placeholder="Explain why this video was rejected..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            rows={3}
                                            className="mt-2"
                                          />
                                        </div>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleRejectVideo(submission.id, rejectionReason)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          >
                                            Reject Video
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {allSubmissions.filter(s => s.status !== 'pending').length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 mt-8">
                      📋 All Submissions History
                    </h3>
                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Video</TableHead>
                              <TableHead>Title</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Submitted</TableHead>
                              <TableHead>Reviewed</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allSubmissions
                              .filter(submission => submission.status !== 'pending')
                              .map((submission) => {
                                const videoId = getVideoId(submission.video_url);
                                return (
                                  <TableRow key={submission.id}>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        {videoId && (
                                          <img
                                            src={`https://img.youtube.com/vi/${videoId}/default.jpg`}
                                            alt={submission.title}
                                            className="w-16 h-12 object-cover rounded"
                                          />
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => window.open(submission.video_url, '_blank')}
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div>
                                        <div className="font-medium">{submission.title}</div>
                                        {submission.description && (
                                          <div className="text-sm text-muted-foreground line-clamp-1">
                                            {submission.description}
                                          </div>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge className={getStatusColor(submission.status)}>
                                        {getStatusIcon(submission.status)}
                                        <span className="ml-1 capitalize">{submission.status}</span>
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {format(new Date(submission.created_at), "MMM d, yyyy")}
                                    </TableCell>
                                    <TableCell>
                                      {submission.reviewed_at
                                        ? format(new Date(submission.reviewed_at), "MMM d, yyyy")
                                        : '-'
                                      }
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

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