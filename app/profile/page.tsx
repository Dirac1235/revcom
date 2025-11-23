import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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
import DashboardNav from "@/components/dashboard-nav";
import { Star } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

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
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="bg-secondary/20 border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">First Name</Label>
                    <Input
                      id="first-name"
                      placeholder="Your first name"
                      defaultValue={profile?.first_name || ""}
                      className="border-border focus-visible:ring-0 focus-visible:border-foreground"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Last Name</Label>
                    <Input
                      id="last-name"
                      placeholder="Your last name"
                      defaultValue={profile?.last_name || ""}
                      className="border-border focus-visible:ring-0 focus-visible:border-foreground"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bio" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself"
                    defaultValue={profile?.bio || ""}
                    className="min-h-32 border-border focus-visible:ring-0 focus-visible:border-foreground resize-none"
                  />
                </div>
                <Button className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 shadow-none">Save Changes</Button>
              </div>
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
                  <p className="text-4xl font-serif font-bold text-foreground">{profile?.rating || 0}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Total Reviews</p>
                  <p className="text-4xl font-serif font-bold text-foreground">
                    {profile?.total_reviews || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
