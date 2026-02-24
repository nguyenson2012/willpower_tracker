import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export type MotivationVideo = Tables<'motivation_videos'>;

// Helper function to normalize YouTube URLs for duplicate checking
const normalizeYouTubeUrl = (url: string): string => {
  // Extract video ID from various YouTube URL formats
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : url; // Return video ID or original URL if no match
};

// Check for duplicate videos by URL
const checkForDuplicate = async (videoUrl: string, excludeId?: string): Promise<boolean> => {
  try {
    const normalizedUrl = normalizeYouTubeUrl(videoUrl);
    console.log('Checking for duplicate of video URL:', videoUrl, 'Normalized as:', normalizedUrl);
    
    let query = supabase
      .from('motivation_videos')
      .select('id, video_url')
      .eq('is_active', true);

    // Only add the neq condition if excludeId is provided and not empty
    if (excludeId && excludeId.trim() !== '') {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;
    console.log('Existing videos fetched for duplicate check:', data);

    if (error) {
      console.error('Error checking for duplicates:', error);
      return false;
    }

    // Check if any existing video has the same video ID
    return data?.some(video => {
      const existingNormalizedUrl = normalizeYouTubeUrl(video.video_url);
      return existingNormalizedUrl === normalizedUrl;
    }) || false;
  } catch (error) {
    console.error('Error in checkForDuplicate:', error);
    return false;
  }
};

export const useMotivationVideos = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<MotivationVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('motivation_videos')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching videos:', error);
        toast.error('Failed to load motivation videos');
      } else {
        setVideos(data || []);
      }
    } catch (error) {
      console.error('Error in fetchVideos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const addVideo = async (videoData: { title: string; video_url: string; description?: string }) => {
    if (!user) return;

    try {
      // Check for duplicates before adding
      const isDuplicate = await checkForDuplicate(videoData.video_url);
      if (isDuplicate) {
        toast.error('This video already exists in the motivation videos list');
        return null;
      }

      const { data, error } = await supabase
        .from('motivation_videos')
        .insert({
          ...videoData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding video:', error);
        toast.error('Failed to add video');
        return null;
      }

      setVideos(prev => [data, ...prev]);
      toast.success('Video added successfully');
      return data;
    } catch (error) {
      console.error('Error in addVideo:', error);
      toast.error('Failed to add video');
      return null;
    }
  };

  const updateVideo = async (id: string, updates: Partial<MotivationVideo>) => {
    try {
      // Check for duplicates if video URL is being updated
      if (updates.video_url) {
        const isDuplicate = await checkForDuplicate(updates.video_url, id);
        if (isDuplicate) {
          toast.error('This video already exists in the motivation videos list');
          return null;
        }
      }

      const { data, error } = await supabase
        .from('motivation_videos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating video:', error);
        toast.error('Failed to update video');
        return null;
      }

      setVideos(prev => prev.map(v => v.id === id ? data : v));
      toast.success('Video updated successfully');
      return data;
    } catch (error) {
      console.error('Error in updateVideo:', error);
      toast.error('Failed to update video');
      return null;
    }
  };

  const deleteVideo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('motivation_videos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting video:', error);
        toast.error('Failed to delete video');
        return false;
      }

      setVideos(prev => prev.filter(v => v.id !== id));
      toast.success('Video deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in deleteVideo:', error);
      toast.error('Failed to delete video');
      return false;
    }
  };

  return {
    videos,
    loading,
    addVideo,
    updateVideo,
    deleteVideo,
    refetch: fetchVideos,
    checkForDuplicate
  };
};