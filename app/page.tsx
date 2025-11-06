import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, MessageSquare, ShoppingBag, Briefcase } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">RevCom</div>
          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <Link href="/messages">
                  <Button variant="outline">Messages</Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline">Profile</Button>
                </Link>
                <form action="/auth/logout" method="post">
                  <Button variant="destructive">Logout</Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-4">Connect Buyers & Sellers Directly</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Post listings, find requests, and build trust through transparent communication
          </p>
          {!user && (
            <div className="flex gap-4 justify-center">
              <Link href="/auth/sign-up">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline">
                  Login
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <ShoppingBag className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Post Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Buyers post their needs and sellers respond with custom offers</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Briefcase className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Browse Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Sellers can explore buyer requests and find opportunities that match their skills
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Direct Messaging</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Communicate securely with buyers or sellers to negotiate terms and details
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        {!user && (
          <div className="mt-16 bg-card border border-border rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Trading?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of buyers and sellers on RevCom. Browse listings, post your needs, or offer your services.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/listings">
                <Button variant="outline" size="lg">
                  Browse Listings
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="lg" className="gap-2">
                  Create Account <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {user && (
          <div className="mt-16 bg-card border border-border rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Go to your dashboard to create listings or browse available opportunities.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/listings">
                <Button variant="outline" size="lg">
                  Browse Listings
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg">Go to Dashboard</Button>
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
