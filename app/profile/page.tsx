"use client";

import { useState, useEffect, FormEvent } from "react";
import { updateProfile } from "@/lib/data/profiles";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function ProfilePage() {
  const { user, profile: authProfile, refreshProfile } = useAuth();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Sync state when authProfile loads asynchronously
  useEffect(() => {
    if (authProfile) {
      setFirstName(authProfile.first_name || "");
      setLastName(authProfile.last_name || "");
      setBio(authProfile.bio || "");
    }
  }, [authProfile]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (!user) return;
    
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      await updateProfile(user.id, {
        first_name: firstName,
        last_name: lastName,
        bio: bio,
      });

      await refreshProfile();
      setSaved(true);
    } catch (updateError: any) {
      setError(updateError.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
      // Clean up the timeout to prevent state updates on unmounted components
      const timer = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  };

  if (!user) {
    return null; // Or consider returning a loading skeleton/spinner here
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-3">
            Profile Settings
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your profile information and preferences
          </p>
        </div>

        <div className="grid gap-8 max-w-2xl">
          <Card className="border-border shadow-none rounded-lg">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-xl font-medium">Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {/* Wrapped in a form for better accessibility and "Enter" key submission */}
              <form onSubmit={handleSave} className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={authProfile?.email || user.email || ""}
                    disabled
                    className="bg-secondary/20 border-transparent cursor-not-allowed"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">First Name</Label>
                    <Input
                      id="first-name"
                      placeholder="Your first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={saving}
                      className="border-border focus-visible:ring-0 focus-visible:border-foreground"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Last Name</Label>
                    <Input
                      id="last-name"
                      placeholder="Your last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={saving}
                      className="border-border focus-visible:ring-0 focus-visible:border-foreground"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bio" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={saving}
                    className="min-h-32 border-border focus-visible:ring-0 focus-visible:border-foreground resize-none"
                  />
                </div>
                
                {error && (
                  <p className="text-sm text-red-500 font-medium">{error}</p>
                )}
                
                <Button 
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 shadow-none"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : saved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Saved!
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border shadow-none rounded-lg">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="flex items-center gap-2 text-xl font-medium">
                <Star className="w-5 h-5 text-foreground" />
                Rating & Reviews
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                    Overall Rating
                  </p>
                  <p className="text-4xl font-serif font-bold text-foreground">{authProfile?.rating || 0}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Total Reviews</p>
                  <p className="text-4xl font-serif font-bold text-foreground">
                    {authProfile?.total_reviews || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-none rounded-lg">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-xl font-medium">Account Type</CardTitle>
              <CardDescription>Your current account type on RevCom</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="inline-flex items-center gap-2 bg-secondary/30 px-4 py-2 rounded-lg">
                <span className="text-lg font-medium capitalize">{authProfile?.user_type || "User"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}