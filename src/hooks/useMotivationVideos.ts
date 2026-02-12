import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export type MotivationVideo = Tables<'motivation_videos'>;

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
    refetch: fetchVideos
  };
};