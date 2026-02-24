import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

// Helper function to normalize YouTube URLs for duplicate checking
const normalizeYouTubeUrl = (url: string): string => {
  // Extract video ID from various YouTube URL formats
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : url; // Return video ID or original URL if no match
};

// Check for duplicate videos across both user submissions and approved motivation videos
const checkForDuplicate = async (videoUrl: string, userId?: string): Promise<{ isDuplicate: boolean, location: string | null }> => {
  try {
    const normalizedUrl = normalizeYouTubeUrl(videoUrl);
    console.log('Checking for duplicate of submitted video URL:', videoUrl, 'Normalized as:', normalizedUrl);
    
    // Check in user submitted videos
    const { data: userVideos, error: userError } = await supabase
      .from('user_submitted_videos')
      .select('id, video_url, status')
      .neq('submitted_by', userId || '');

    if (userError) {
      console.error('Error checking user submitted videos for duplicates:', userError);
    } else {
      const userDuplicate = userVideos?.find(video => {
        const existingNormalizedUrl = normalizeYouTubeUrl(video.video_url);
        return existingNormalizedUrl === normalizedUrl;
      });
      
      if (userDuplicate) {
        const status = userDuplicate.status === 'approved' ? 'approved submissions' : 
                      userDuplicate.status === 'pending' ? 'pending submissions' : 'submissions';
        return { isDuplicate: true, location: status };
      }
    }
    
    // Check in approved motivation videos
    const { data: motivationVideos, error: motivationError } = await supabase
      .from('motivation_videos')
      .select('id, video_url')
      .eq('is_active', true);

    if (motivationError) {
      console.error('Error checking motivation videos for duplicates:', motivationError);
    } else {
      const motivationDuplicate = motivationVideos?.find(video => {
        const existingNormalizedUrl = normalizeYouTubeUrl(video.video_url);
        return existingNormalizedUrl === normalizedUrl;
      });
      
      if (motivationDuplicate) {
        return { isDuplicate: true, location: 'motivation videos' };
      }
    }

    return { isDuplicate: false, location: null };
  } catch (error) {
    console.error('Error in checkForDuplicate:', error);
    return { isDuplicate: false, location: null };
  }
};

export interface UserSubmittedVideo {
  id: string;
  title: string;
  video_url: string;
  description?: string | null;
  status: string; // 'pending' | 'approved' | 'rejected'
  submitted_by: string;
  reviewed_by?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at?: string | null;
}

export const useUserSubmittedVideos = () => {
  const [userVideos, setUserVideos] = useState<UserSubmittedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUserVideos = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_submitted_videos')
        .select('*')
        .eq('submitted_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user submitted videos:', error);
        return;
      }

      setUserVideos((data || []) as UserSubmittedVideo[]);
    } catch (error) {
      console.error('Error fetching user submitted videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitVideo = async (videoData: { 
    title: string; 
    video_url: string; 
    description?: string 
  }) => {
    if (!user) throw new Error('User not authenticated');

    console.log('Submitting video:', videoData, 'by user:', user.id);

    // Check for duplicates before submitting
    const { isDuplicate, location } = await checkForDuplicate(videoData.video_url, user.id);
    if (isDuplicate) {
      const errorMessage = `This video already exists in ${location}. Please submit a different video.`;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    const { data, error } = await supabase
      .from('user_submitted_videos')
      .insert([
        {
          ...videoData,
          submitted_by: user.id,
        }
      ])
      .select();

    if (error) {
      console.error('Error submitting video:', error);
      throw error;
    }

    console.log('Video submitted successfully:', data);
    // Refresh the list
    await fetchUserVideos();
    return data;
  };

  useEffect(() => {
    fetchUserVideos();
  }, [user]);

  return {
    userVideos,
    loading,
    submitVideo,
    refreshVideos: fetchUserVideos,
    checkForDuplicate,
  };
};