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
import { Badge } from "@/components/ui/badge";
import { Star, Loader2, CheckCircle2, Calendar, MessageSquare } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatDistanceToNow } from "date-fns";

export default function ProfilePage() {
  const { user, profile: authProfile, refreshProfile } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authProfile) {
      setFirstName(authProfile.first_name || "");
      setLastName(authProfile.last_name || "");
      setBio(authProfile.bio || "");
    }
  }, [authProfile]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
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
      const timer = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  };

  if (!user) {
    return null;
  }

  const displayName =
    authProfile?.first_name && authProfile?.last_name
      ? `${authProfile.first_name} ${authProfile.last_name}`
      : null;

  const initials = displayName
    ? `${authProfile!.first_name![0]}${authProfile!.last_name![0]}`.toUpperCase()
    : (user.email?.[0] || "U").toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-10 pb-8 border-b border-border">
          <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
            {authProfile?.avatar_url ? (
              <img
                src={authProfile.avatar_url}
                alt={displayName || "Profile"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-primary">
                {initials}
              </span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-foreground">
                {displayName || "Your Profile"}
              </h1>
              <Badge variant="secondary" className="capitalize">
                {authProfile?.user_type || "User"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {authProfile?.email || user.email}
            </p>
            {authProfile?.created_at && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Member for{" "}
                {formatDistanceToNow(new Date(authProfile.created_at))}
              </p>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-border shadow-none rounded-lg">
              <CardHeader className="pb-4 pt-6 px-6">
                <CardTitle className="text-xl font-medium">
                  Personal Information
                </CardTitle>
                <CardDescription>Update your profile details</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <form onSubmit={handleSave} className="grid gap-6">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="email"
                      className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      Email
                    </Label>
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
                      <Label
                        htmlFor="first-name"
                        className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        First Name
                      </Label>
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
                      <Label
                        htmlFor="last-name"
                        className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        Last Name
                      </Label>
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
                    <Label
                      htmlFor="bio"
                      className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      Bio
                    </Label>
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
          </div>

          <div className="space-y-6">
            <Card className="border-border shadow-none rounded-lg">
              <CardContent className="pt-6 px-6 pb-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  </div>
                  <p className="text-4xl font-bold text-foreground">
                    {Number(authProfile?.rating || 0).toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">
                    Overall Rating
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-none rounded-lg">
              <CardContent className="pt-6 px-6 pb-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-4xl font-bold text-foreground">
                    {authProfile?.total_reviews || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">
                    Total Reviews
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
