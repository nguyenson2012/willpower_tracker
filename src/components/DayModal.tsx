import { useState } from "react";
import { format } from "date-fns";
import { DailyEntry } from "@/hooks/useEntries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface DayModalProps {
  date: Date;
  entry?: DailyEntry;
  onClose: () => void;
  onSave: (date: string, completed: boolean, notes: string) => Promise<void>;
}

const DayModal = ({ date, entry, onClose, onSave }: DayModalProps) => {
  const [completed, setCompleted] = useState(entry?.completed ?? false);
  const [notes, setNotes] = useState(entry?.notes ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(format(date, "yyyy-MM-dd"), completed, notes);
    toast.success(completed ? "Great job! Keep your streak going 💪" : "Entry saved.");
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {format(date, "EEEE, MMMM d, yyyy")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="completed" className="text-base font-medium">
              I completed my challenge today
            </Label>
            <Switch
              id="completed"
              checked={completed}
              onCheckedChange={setCompleted}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">What challenges did you complete today?</Label>
            <Textarea
              id="notes"
              placeholder="Write about your accomplishments..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DayModal;
