import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Save, User, Link as LinkIcon, Loader2, Camera, Mail, Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
    const { user } = useAuth();
    const { profile, loading: profileLoading, isAdmin, updateProfile } = useUserProfile();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [username, setUsername] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Sync form state with profile data
    useEffect(() => {
        if (profile) {
            setUsername(profile.username || "");
            setAvatarUrl(profile.avatar_url || "");
        }
    }, [profile]);

    // Track changes
    useEffect(() => {
        if (profile) {
            const changed =
                (username !== (profile.username || "")) ||
                (avatarUrl !== (profile.avatar_url || ""));
            setHasChanges(changed);
        }
    }, [username, avatarUrl, profile]);

    const getInitials = () => {
        if (username) {
            return username.slice(0, 2).toUpperCase();
        }
        if (user?.email) {
            return user.email.slice(0, 2).toUpperCase();
        }
        return "??";
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProfile({
                username: username.trim() || undefined,
                avatar_url: avatarUrl.trim() || undefined,
            });
            toast({
                title: "Profile updated! ✨",
                description: "Your changes have been saved successfully.",
            });
            setHasChanges(false);
        } catch (error: any) {
            console.error("Error updating profile:", error);
            let message = "Failed to update profile. Please try again.";
            if (error?.message?.includes("user_profiles_username_unique")) {
                message = "This username is already taken. Please choose another one.";
            }
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    if (profileLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <span className="text-2xl animate-flame-pulse">🔥</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/")}
                            className="flex items-center gap-1"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Back</span>
                        </Button>
                        <div className="h-5 w-px bg-border" />
                        <span className="text-2xl animate-flame-pulse">🔥</span>
                        <h1 className="text-xl font-bold font-display text-foreground">My Profile</h1>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group">
                        <Avatar className="h-28 w-28 border-4 border-primary/20 shadow-lg shadow-primary/10 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/20">
                            <AvatarImage src={avatarUrl || undefined} alt={username || "User avatar"} />
                            <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary/80 to-primary text-primary-foreground">
                                {getInitials()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <Camera className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <h2 className="mt-4 text-xl font-bold font-display text-foreground">
                        {username || user?.email?.split("@")[0] || "Anonymous"}
                    </h2>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    {isAdmin && (
                        <div className="mt-2 flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/20 rounded-full">
                            <Shield className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Admin</span>
                        </div>
                    )}
                </div>

                {/* Profile Form */}
                <Card className="border-border/50 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Profile Information
                        </CardTitle>
                        <CardDescription>
                            Update your display name and avatar. These will be visible across the app.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Email (read-only) */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-3.5 w-3.5" />
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={user?.email || ""}
                                disabled
                                className="bg-muted/50 cursor-not-allowed"
                            />
                            <p className="text-xs text-muted-foreground">
                                Email cannot be changed here.
                            </p>
                        </div>

                        {/* Username */}
                        <div className="space-y-2">
                            <Label htmlFor="username" className="flex items-center gap-2">
                                <User className="h-3.5 w-3.5" />
                                Username
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Enter your display name"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                maxLength={30}
                                className="transition-all duration-200 focus:ring-primary/50"
                            />
                            <p className="text-xs text-muted-foreground">
                                {username.length}/30 characters. This will be your display name.
                            </p>
                        </div>

                        {/* Avatar URL */}
                        <div className="space-y-2">
                            <Label htmlFor="avatar_url" className="flex items-center gap-2">
                                <LinkIcon className="h-3.5 w-3.5" />
                                Avatar URL
                            </Label>
                            <Input
                                id="avatar_url"
                                type="url"
                                placeholder="https://example.com/your-avatar.jpg"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                className="transition-all duration-200 focus:ring-primary/50"
                            />
                            <p className="text-xs text-muted-foreground">
                                Paste a link to your profile picture. Supported formats: JPG, PNG, GIF, WebP.
                            </p>
                        </div>

                        {/* Avatar Preview */}
                        {avatarUrl && (
                            <div className="space-y-2">
                                <Label className="text-muted-foreground">Preview</Label>
                                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
                                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                                        <AvatarImage src={avatarUrl} alt="Avatar preview" />
                                        <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground text-sm font-bold">
                                            {getInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{username || "Your Name"}</p>
                                        <p className="text-xs text-muted-foreground">Profile avatar preview</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                            <Button
                                variant="outline"
                                onClick={() => navigate("/")}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving || !hasChanges}
                                className="min-w-[120px] transition-all duration-200"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Info Footer */}
                <div className="mt-6 p-4 rounded-lg bg-muted/20 border border-border/30">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Account Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                            <span className="font-medium">User ID:</span>{" "}
                            <span className="font-mono">{user?.id?.slice(0, 8)}...</span>
                        </div>
                        <div>
                            <span className="font-medium">Member since:</span>{" "}
                            <span>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
