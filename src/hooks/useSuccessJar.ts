import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface SuccessItem {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
}

export const useSuccessJar = () => {
    const { user } = useAuth();
    const [items, setItems] = useState<SuccessItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchItems = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        const { data, error } = await supabase
            .from("success_jar")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching success items:", error);
            toast.error("Failed to load your success jar");
        } else if (data) {
            setItems(data);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const addSuccess = async (content: string) => {
        if (!user) return;

        const { data, error } = await supabase
            .from("success_jar")
            .insert({ user_id: user.id, content })
            .select("*")
            .single();

        if (error) {
            console.error("Error adding success item:", error);
            toast.error("Failed to add to your success jar");
            return null;
        } else {
            setItems((prev) => [data, ...prev]);
            toast.success("Added to your cooking jar! 🍯");
            return data;
        }
    };

    const deleteSuccess = async (id: string) => {
        if (!user) return;

        const { error } = await supabase
            .from("success_jar")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting success item:", error);
            toast.error("Failed to remove item");
        } else {
            setItems((prev) => prev.filter((item) => item.id !== id));
            toast.success("Item removed from jar");
        }
    };

    const getRandomSuccess = () => {
        if (items.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * items.length);
        return items[randomIndex];
    };

    return { items, loading, addSuccess, deleteSuccess, getRandomSuccess, refetch: fetchItems };
};
