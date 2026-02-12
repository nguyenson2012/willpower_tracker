
import { useState } from "react";
import { useSuccessJar } from "@/hooks/useSuccessJar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Sparkles,
    History,
    Trash2,
    X,
    MessageSquareQuote
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

const SuccessJar = () => {
    const { items, loading, addSuccess, deleteSuccess, getRandomSuccess } = useSuccessJar();
    const [newSuccess, setNewSuccess] = useState("");
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [randomItem, setRandomItem] = useState<any>(null);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSuccess.trim()) return;

        await addSuccess(newSuccess);
        setNewSuccess("");
    };

    const handleDraw = () => {
        const item = getRandomSuccess();
        setRandomItem(item);
    };

    return (
        <Card className="flex flex-col h-[350px] border-border/50 bg-card/80 backdrop-blur-sm shadow-lg overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="font-bold flex items-center gap-2 text-primary text-base">
                        <span className="text-xl">🍯</span>
                        Cookie Jar
                    </CardTitle>
                    <div className="flex gap-2">
                        <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                            <DialogTrigger asChild>
                                <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground">
                                    <History className="h-4 w-4" />
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md max-h-[80vh]">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <History className="h-5 w-5" />
                                        Success History
                                    </DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="h-[50vh] pr-4">
                                    <div className="space-y-4">
                                        {items.length === 0 ? (
                                            <p className="text-center text-muted-foreground py-8">Your jar is empty. Add your first success!</p>
                                        ) : (
                                            items.map((item) => (
                                                <div key={item.id} className="group relative bg-muted/50 p-3 rounded-lg border border-border/50">
                                                    <p className="text-sm pr-8">{item.content}</p>
                                                    <p className="text-[10px] text-muted-foreground mt-2">
                                                        {format(new Date(item.created_at), "MMM d, yyyy")}
                                                    </p>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                                        onClick={() => deleteSuccess(item.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-4 pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                    Collect your small wins. Revisit them when things get tough.
                </p>

                <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                    <Input
                        placeholder="What's a win today?"
                        value={newSuccess}
                        onChange={(e) => setNewSuccess(e.target.value)}
                        className="h-9 text-sm"
                    />
                    <Button type="submit" size="icon" className="h-9 w-9 shrink-0">
                        <Plus className="h-4 w-4" />
                    </Button>
                </form>

                <div className="space-y-2 flex-1">
                    <Button
                        variant="outline"
                        className="w-full flex items-center gap-2 bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary h-10"
                        onClick={handleDraw}
                        disabled={items.length === 0}
                    >
                        <Sparkles className="h-4 w-4" />
                        Draw a reminder
                    </Button>

                    {randomItem && (
                        <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10 relative animate-in fade-in slide-in-from-top-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 text-muted-foreground"
                                onClick={() => setRandomItem(null)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                            <div className="flex gap-3">
                                <MessageSquareQuote className="h-5 w-5 text-primary shrink-0 mt-1" />
                                <div>
                                    <p className="text-sm italic text-foreground leading-relaxed line-clamp-3">
                                        "{randomItem.content}"
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-2">
                                        Recorded on {format(new Date(randomItem.created_at), "MMM d, yyyy")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-border/50 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-900/20 rounded-full">
                        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                            {items.length} Successes stored
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default SuccessJar;
