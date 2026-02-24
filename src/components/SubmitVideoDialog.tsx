import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload } from "lucide-react";
import { useUserSubmittedVideos } from "@/hooks/useUserSubmittedVideos";
import { toast } from "sonner";

interface SubmitVideoDialogProps {
  children?: React.ReactNode;
}

export const SubmitVideoDialog = ({ children }: SubmitVideoDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const { submitVideo, checkForDuplicate } = useUserSubmittedVideos();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !videoUrl.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w\-_]{11}(&\S*)?$/;
    if (!youtubeRegex.test(videoUrl.trim())) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }

    try {
      setCheckingDuplicate(true);
      
      // Check for duplicates before submitting
      const { isDuplicate, location } = await checkForDuplicate(videoUrl.trim());
      
      if (isDuplicate) {
        const confirmSubmit = window.confirm(
          `⚠️ Warning: This video appears to already exist in ${location}.\n\nSubmitting duplicate videos may result in rejection. Do you still want to submit it?`
        );
        
        if (!confirmSubmit) {
          setCheckingDuplicate(false);
          return;
        }
      }

      setCheckingDuplicate(false);
      setSubmitting(true);
      
      await submitVideo({
        title: title.trim(),
        video_url: videoUrl.trim(),
        description: description.trim() || undefined,
      });

      toast.success("Video submitted successfully! It will be reviewed by our admin team.");
      
      // Reset form
      setTitle("");
      setVideoUrl("");
      setDescription("");
      setOpen(false);
    } catch (error) {
      console.error("Error submitting video:", error);
      if (error instanceof Error && error.message.includes('already exists')) {
        // This error came from the hook's duplicate check
        // The toast was already shown in the hook
      } else {
        toast.error("Failed to submit video. Please try again.");
      }
    } finally {
      setSubmitting(false);
      setCheckingDuplicate(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Submit Video
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Submit Your Motivation Video
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter video title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="videoUrl">YouTube URL *</Label>
            <Input
              id="videoUrl"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of your video..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <p className="font-medium text-blue-900 mb-1">📝 Submission Guidelines:</p>
            <ul className="text-blue-800 text-xs space-y-1">
              <li>• Only YouTube videos are accepted</li>
              <li>• Videos will be reviewed by admin before going live</li>
              <li>• You'll receive a notification about the review status</li>
            </ul>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={submitting || checkingDuplicate}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || checkingDuplicate}
              className="flex-1"
            >
              {checkingDuplicate ? "Checking..." : submitting ? "Submitting..." : "Submit for Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};