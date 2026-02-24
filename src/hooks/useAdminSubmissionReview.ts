import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { UserSubmittedVideo } from "@/hooks/useUserSubmittedVideos";

export const useAdminSubmissionReview = () => {
  const [pendingVideos, setPendingVideos] = useState<UserSubmittedVideo[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<UserSubmittedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAllSubmissions = async () => {
    if (!user) {
      console.log('No user authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching submissions as admin...');
      
      // Try the RPC function first
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_user_submitted_videos_for_admin');

      if (rpcData && !rpcError) {
        console.log('Fetched submissions via RPC:', rpcData);
        setAllSubmissions((rpcData || []) as UserSubmittedVideo[]);
        setPendingVideos((rpcData?.filter(video => video.status === 'pending') || []) as UserSubmittedVideo[]);
        return;
      } else {
        console.log('RPC failed, trying direct query:', rpcError);
      }
      
      // Fallback to direct query
      const { data, error } = await supabase
        .from('user_submitted_videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
        return;
      }

      console.log('Fetched submissions via direct query:', data);
      setAllSubmissions((data || []) as UserSubmittedVideo[]);
      setPendingVideos((data?.filter(video => video.status === 'pending') || []) as UserSubmittedVideo[]);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveVideo = async (submissionId: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.rpc('approve_user_video', {
      submission_id: submissionId,
      admin_id: user.id
    });

    if (error) {
      console.error('Error approving video:', error);
      throw error;
    }

    // Refresh the list
    await fetchAllSubmissions();
  };

  const rejectVideo = async (submissionId: string, reason?: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase.rpc('reject_user_video', {
      submission_id: submissionId,
      admin_id: user.id,
      reason: reason || null
    });

    if (error) {
      console.error('Error rejecting video:', error);
      throw error;
    }

    // Refresh the list
    await fetchAllSubmissions();
  };

  useEffect(() => {
    fetchAllSubmissions();
  }, []);

  return {
    pendingVideos,
    allSubmissions,
    loading,
    approveVideo,
    rejectVideo,
    refreshSubmissions: fetchAllSubmissions,
  };
};