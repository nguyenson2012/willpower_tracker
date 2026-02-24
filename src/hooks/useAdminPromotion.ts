import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const useAdminPromotion = () => {
  const { user } = useAuth();

  const promoteToAdmin = async () => {
    if (!user) {
      toast.error("Not authenticated");
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ 
          id: user.id, 
          role: 'admin' 
        });

      if (error) {
        console.error('Error promoting to admin:', error);
        toast.error("Failed to promote to admin");
      } else {
        toast.success("You are now an admin! Refresh the page.");
      }
    } catch (error) {
      console.error('Error promoting to admin:', error);
      toast.error("Failed to promote to admin");
    }
  };

  return { promoteToAdmin };
};