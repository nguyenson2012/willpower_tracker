import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { format } from "date-fns";

export interface DailyEntry {
  id: string;
  user_id: string;
  entry_date: string;
  completed: boolean;
  notes: string;
}

export const useEntries = (from: Date, to: Date) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [allEntries, setAllEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("daily_entries")
      .select("id, user_id, entry_date, completed, notes")
      .gte("entry_date", format(from, "yyyy-MM-dd"))
      .lte("entry_date", format(to, "yyyy-MM-dd"));

    if (!error && data) {
      setEntries(data);
    }
    setLoading(false);
  }, [user, format(from, "yyyy-MM-dd"), format(to, "yyyy-MM-dd")]);

  const fetchAllEntries = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("daily_entries")
      .select("id, user_id, entry_date, completed, notes")
      .eq("completed", true)
      .order("entry_date", { ascending: false });

    if (!error && data) {
      setAllEntries(data);
    }
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    fetchAllEntries();
  }, [fetchAllEntries]);

  const upsertEntry = async (entryDate: string, completed: boolean, notes: string) => {
    if (!user) return;

    const existing = entries.find((e) => e.entry_date === entryDate);

    if (existing) {
      const { error } = await supabase
        .from("daily_entries")
        .update({ completed, notes })
        .eq("id", existing.id);

      if (!error) {
        setEntries((prev) =>
          prev.map((e) => (e.id === existing.id ? { ...e, completed, notes } : e))
        );
        fetchAllEntries();
      }
    } else {
      const { data, error } = await supabase
        .from("daily_entries")
        .insert({ user_id: user.id, entry_date: entryDate, completed, notes })
        .select("id, user_id, entry_date, completed, notes")
        .single();

      if (!error && data) {
        setEntries((prev) => [...prev, data]);
        fetchAllEntries();
      }
    }
  };

  return { entries, allEntries, loading, upsertEntry, refetch: fetchEntries };
};
