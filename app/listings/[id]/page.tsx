import { notFound } from "next/navigation";
import { getRequestById } from "@/lib/data/requests-server";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquare,
  ChevronLeft,
  DollarSign,
  Package,
  User,
  Calendar,
  Tag,
  Star,
  CheckCircle,
  Clock,
  MapPin,
  Send,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  TrendingUp,
  Eye,
  Users,
  Zap,
  Shield,
  Truck,
  Award,
  FileText,
} from "lucide-react";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  let request;
  try {
    request = await getRequestById(id);
  } catch (error) {
    notFound();
  }

  if (!request) {
    notFound();
  }

  // Fetch offers for this request
  const { data: offers } = await supabase
    .from("offers")
    .select("*, profiles(id, first_name, last_name, email, avatar_url, rating, total_reviews, location, verified)")
    .eq("request_id", id)
    .order("created_at", { ascending: false });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = profileData;
  }

  const buyerName = request.profiles
    ? `${request.profiles.first_name || ""} ${
        request.profiles.last_name || ""
      }`.trim() || "Anonymous"
    : "Anonymous";

  const isBuyer = user?.id === request.buyer_id;
  const isSeller = user && !isBuyer;
  const sellerHasOffer = offers?.some(o => o.seller_id === user?.id);
  const offersCount = offers?.length || 0;
  const deadlineDate = request.deadline ? new Date(request.deadline) : null;
  const isDeadlinePassed = deadlineDate && deadlineDate < new Date();
  const daysUntilDeadline = deadlineDate ? Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "open":
        return "default";
      case "negotiating":
        return "secondary";
      case "closed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "negotiating":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "closed":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  // Calculate average offer price
  const acceptedOffer = offers?.find(o => o.status === 'accepted');
  const averageOfferPrice = offers && offers.length > 0
    ? Math.round(offers.reduce((sum, o) => sum + o.price, 0) / offers.length)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <Link
          href="/requests"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Requests
        </Link>

        {/* Two-Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* LEFT COLUMN (65%) - Request Details */}
          <div className="lg:col-span-2.5 space-y-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            
            {/* Header Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs font-semibold uppercase tracking-wider px-3 py-1">
                    {request.category}
                  </Badge>
                  {request.urgent && (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs font-semibold">
                      <Zap className="w-3 h-3 mr-1" />
                      Urgent
                    </Badge>
                  )}
                </div>
                <Badge 
                  variant={getStatusVariant(request.status)}
                  className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 w-fit ${
                    request.status === "open" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" :
                    request.status === "negotiating" ? "bg-amber-100 text-amber-800 hover:bg-amber-100" :
                    "bg-red-100 text-red-800 hover:bg-red-100"
                  }`}
                >
                  {request.status}
                </Badge>
              </div>
              
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-3">
                  {request.title}
                </h1>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Posted {new Date(request.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}</span>
                </div>
                {deadlineDate && (
                  <div className={`flex items-center gap-1.5 font-semibold ${isDeadlinePassed ? 'text-red-600' : daysUntilDeadline && daysUntilDeadline <= 3 ? 'text-amber-600' : ''}`}>
                    <Clock className="w-4 h-4" />
                    <span>Due {deadlineDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}</span>
                    {daysUntilDeadline && daysUntilDeadline > 0 && (
                      <span className="text-xs">({daysUntilDeadline} days left)</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 animate-fadeIn" style={{ animationDelay: '0.15s' }}>
              <Card className="border-border/30 shadow-sm">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Responses</p>
                      <p className="text-2xl font-bold text-foreground">{offersCount}</p>
                    </div>
                    <Users className="w-8 h-8 text-primary/20" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/30 shadow-sm">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Views</p>
                      <p className="text-2xl font-bold text-foreground">{request.views || 0}</p>
                    </div>
                    <Eye className="w-8 h-8 text-primary/20" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/30 shadow-sm">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Avg Price</p>
                      <p className="text-2xl font-bold text-foreground">{averageOfferPrice ? averageOfferPrice.toLocaleString() : 'N/A'}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-primary/20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card className="border-border/30 shadow-sm animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Request Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/80 leading-relaxed text-sm whitespace-pre-wrap">
                  {request.description}
                </p>
                
                {request.specifications && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Key Requirements</p>
                      <ul className="space-y-2">
                        {typeof request.specifications === 'object' && Object.entries(request.specifications).map(([key, value]) => (
                          <li key={key} className="flex items-start gap-2 text-sm">
                            <span className="text-primary font-bold mt-1">•</span>
                            <span className="text-foreground/80"><span className="font-semibold text-foreground capitalize">{key.replace(/_/g, ' ')}:</span> {String(value)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Budget, Quantity, Location Grid */}
            <div className="grid sm:grid-cols-2 gap-4 animate-fadeIn" style={{ animationDelay: '0.25s' }}>
              <Card className="border-border/30 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-lg bg-primary/10">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Budget Range</p>
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {request.budget_min && request.budget_max
                      ? `${(request.budget_min / 1000).toFixed(0)}K - ${(request.budget_max / 1000).toFixed(0)}K`
                      : "Not specified"}
                  </p>
                  <p className="text-xs text-muted-foreground">ETB</p>
                  {acceptedOffer && (
                    <div className="mt-3 pt-3 border-t border-border/30">
                      <p className="text-xs text-muted-foreground mb-1">Accepted Price</p>
                      <p className="text-xl font-bold text-emerald-600">{acceptedOffer.price.toLocaleString()} ETB</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/30 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-lg bg-primary/10">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quantity</p>
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {request.quantity || 1}
                  </p>
                  <p className="text-xs text-muted-foreground">units needed</p>
                  {request.unit_type && (
                    <div className="mt-3 pt-3 border-t border-border/30">
                      <p className="text-xs text-muted-foreground">Type: <span className="text-foreground font-semibold">{request.unit_type}</span></p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {request.location && (
                <Card className="sm:col-span-2 border-border/30 shadow-sm hover:shadow-md transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 rounded-lg bg-primary/10">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Delivery Location</p>
                    </div>
                    <p className="text-lg font-semibold text-foreground mb-2">
                      {request.location}
                    </p>
                    {request.delivery_method && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Truck className="w-4 h-4" />
                        <span>{request.delivery_method}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Additional Info Tabs */}
            <Card className="border-border/30 shadow-sm animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              <CardContent className="pt-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                    <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
                    <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="space-y-3">
                      {request.payment_terms && (
                        <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                          <span className="text-sm font-medium text-muted-foreground">Payment Terms</span>
                          <span className="text-sm font-semibold text-foreground">{request.payment_terms}</span>
                        </div>
                      )}
                      {request.quality_requirements && (
                        <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                          <span className="text-sm font-medium text-muted-foreground">Quality Standards</span>
                          <span className="text-sm font-semibold text-foreground">{request.quality_requirements}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/30">
                        <span className="text-sm font-medium text-muted-foreground">Total Responses</span>
                        <span className="text-sm font-semibold text-foreground">{offersCount}</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="text-sm text-muted-foreground">Posted on {new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                      {deadlineDate && (
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${isDeadlinePassed ? 'bg-red-600' : 'bg-amber-500'}`}></div>
                          <span className={`text-sm ${isDeadlinePassed ? 'text-red-600' : 'text-amber-600'}`}>
                            Deadline: {deadlineDate.toLocaleDateString()} {isDeadlinePassed ? '(Passed)' : '(Active)'}
                          </span>
                        </div>
                      )}
                      {acceptedOffer && (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                          <span className="text-sm text-emerald-600">Offer accepted on {new Date(acceptedOffer.created_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 rounded">
                        <span className="text-muted-foreground">Budget Ceiling</span>
                        <span className="font-semibold text-foreground">{request.budget_max?.toLocaleString()} ETB</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-secondary/30">
                        <span className="text-muted-foreground">Budget Floor</span>
                        <span className="font-semibold text-foreground">{request.budget_min?.toLocaleString()} ETB</span>
                      </div>
                      {averageOfferPrice && (
                        <div className="flex justify-between p-2 rounded">
                          <span className="text-muted-foreground">Average Offer Price</span>
                          <span className="font-semibold text-foreground">{averageOfferPrice.toLocaleString()} ETB</span>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN (35%) - Buyer Info & Actions */}
          <div className="lg:col-span-1.5 space-y-5 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            
            {/* Buyer Info Card */}
            <Card className="border-border/30 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Buyer Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-16 h-16 ring-2 ring-primary/20">
                    <AvatarImage src={request.profiles?.avatar_url} alt={buyerName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {buyerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm truncate">
                      {buyerName}
                    </h4>
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-foreground text-xs">
                          {request.profiles?.rating || 'N/A'}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({request.profiles?.total_reviews || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  {request.profiles?.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Location</p>
                        <p className="text-sm text-foreground font-medium">{request.profiles.location}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-semibold">Verified Buyer</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <Award className="w-4 h-4" />
                    <span className="text-xs font-semibold">Trusted Member</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded-lg bg-secondary/30">
                    <span className="text-muted-foreground">Completion Rate</span>
                    <span className="font-semibold text-foreground">92%</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-secondary/30">
                    <span className="text-muted-foreground">Response Time</span>
                    <span className="font-semibold text-foreground">2 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="border-border/30 shadow-sm animate-fadeIn" style={{ animationDelay: '0.25s' }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user ? (
                  isBuyer ? (
                    <>
                      <Link href={`/buyer/requests/${id}/edit`} className="w-full">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 text-sm font-semibold">
                          <Send className="w-4 h-4 mr-1.5" />
                          Edit Request
                        </Button>
                      </Link>
                      <Link href={`/requests/${id}`} className="w-full">
                        <Button variant="outline" className="w-full h-10 text-sm font-semibold">
                          <Eye className="w-4 h-4 mr-1.5" />
                          Preview Page
                        </Button>
                      </Link>
                    </>
                  ) : isSeller ? (
                    <>
                      {sellerHasOffer ? (
                        <Alert className="border-amber-200 bg-amber-50 py-3">
                          <AlertCircle className="h-4 w-4 text-amber-700" />
                          <AlertTitle className="text-amber-800 text-xs">Already Submitted</AlertTitle>
                          <AlertDescription className="text-amber-700 text-xs mt-1">
                            Your offer is listed below. Message buyer to negotiate.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Link href={`/requests/${id}/make-offer`} className="w-full">
                          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 text-sm font-semibold">
                            <Send className="w-4 h-4 mr-1.5" />
                            Send Offer
                          </Button>
                        </Link>
                      )}
                      <Link href={`/messages?request_id=${id}&to=${request.buyer_id}`} className="w-full">
                        <Button variant="outline" className="w-full h-10 text-sm font-semibold">
                          <MessageSquare className="w-4 h-4 mr-1.5" />
                          Message Buyer
                        </Button>
                      </Link>
                    </>
                  ) : null
                ) : (
                  <Link href="/auth/sign-up" className="w-full">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 text-sm font-semibold">
                      <Send className="w-4 h-4 mr-1.5" />
                      Sign Up to Respond
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Offers Count Card */}
            {isSeller && !sellerHasOffer && offersCount > 0 && (
              <Card className="border-border/30 shadow-sm animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Competition</p>
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1">{offersCount}</p>
                  <p className="text-xs text-muted-foreground">seller{offersCount !== 1 ? 's have' : ' has'} responded</p>
                  {averageOfferPrice && (
                    <>
                      <Separator className="my-3" />
                      <div className="text-xs">
                        <p className="text-muted-foreground mb-1">Avg Offer Price</p>
                        <p className="text-lg font-bold text-foreground">{averageOfferPrice.toLocaleString()} ETB</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Trust Badges */}
            <Card className="border-border/30 shadow-sm animate-fadeIn" style={{ animationDelay: '0.35s' }}>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-4">Trust & Security</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-medium text-foreground">Secure Platform</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-medium text-foreground">Verified Users</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                    <Award className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-medium text-foreground">Buyer Protection</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* OFFERS SECTION */}
        {offersCount > 0 && (
          <div className="mt-12 pt-8 border-t border-border/30 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {isBuyer ? `Offers Received (${offersCount})` : `Offers (${offersCount})`}
              </h2>
              {averageOfferPrice && (
                <Badge variant="secondary" className="text-xs">
                  Avg: {averageOfferPrice.toLocaleString()} ETB
                </Badge>
              )}
            </div>

            <div className="space-y-4">
              {offers?.map((offer, idx) => {
                const userHasSubmittedOffer = user?.id === offer.seller_id;
                const offerStatusVariant = 
                  offer.status === 'pending' ? 'secondary' :
                  offer.status === 'accepted' ? 'default' :
                  'destructive' as const;
                
                return (
                  <Card key={offer.id} className={`border-border/30 shadow-sm hover:shadow-md transition-all duration-300 ${offer.status === 'accepted' ? 'border-emerald-200 bg-emerald-50/30' : ''}`}>
                    <CardContent className="pt-6">
                      <Tabs defaultValue="details" className="w-full">
                        <TabsList className="mb-4 grid w-full grid-cols-2">
                          <TabsTrigger value="details">Details</TabsTrigger>
                          <TabsTrigger value="actions">Actions</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="space-y-4">
                          {/* Seller Info */}
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Seller #{idx + 1}</p>
                            <div className="flex items-start gap-4">
                              <Avatar className="w-14 h-14 ring-2 ring-primary/20">
                                <AvatarImage src={offer.profiles?.avatar_url} />
                                <AvatarFallback className="bg-secondary/20">
                                  <User className="w-6 h-6 text-muted-foreground" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground text-sm truncate">
                                  {`${offer.profiles?.first_name} ${offer.profiles?.last_name}`.trim()}
                                </h4>
                                <div className="flex items-center gap-1 mt-1 flex-wrap">
                                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                  <span className="font-semibold text-foreground text-xs">
                                    {offer.profiles?.rating || 'N/A'}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    ({offer.profiles?.total_reviews || 0} reviews)
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  {offer.profiles?.verified && (
                                    <Badge variant="secondary" className="text-xs">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                  {userHasSubmittedOffer && (
                                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                                      Your Offer
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Price & Status */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Offered Price</p>
                              <div>
                                <p className="text-3xl font-bold text-foreground">
                                  {(offer.price / 1000).toFixed(1)}K
                                </p>
                                <p className="text-xs text-muted-foreground">ETB</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Status</p>
                              <Badge variant={offerStatusVariant} className={`text-xs font-semibold
                                ${offer.status === 'pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : 
                                  offer.status === 'accepted' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' :
                                  'bg-red-100 text-red-800 hover:bg-red-100'}`}
                              >
                                {offer.status === 'pending' ? 'Pending' : 
                                 offer.status === 'accepted' ? 'Accepted' : 'Rejected'}
                              </Badge>
                            </div>
                          </div>

                          {/* Price Analysis */}
                          <div className="p-3 rounded-lg bg-secondary/30">
                            <p className="text-xs text-muted-foreground mb-2">Price vs Budget</p>
                            <div className="space-y-1 text-xs">
                              {offer.price < request.budget_min && (
                                <p className="text-emerald-600 font-semibold">✓ Below budget minimum</p>
                              )}
                              {offer.price > request.budget_max && (
                                <p className="text-red-600 font-semibold">✗ Exceeds budget maximum</p>
                              )}
                              {offer.price >= request.budget_min && offer.price <= request.budget_max && (
                                <p className="text-blue-600 font-semibold">✓ Within budget range</p>
                              )}
                              <p className="text-muted-foreground mt-1">
                                Variance: {((offer.price - averageOfferPrice!) / averageOfferPrice! * 100).toFixed(1)}% vs avg
                              </p>
                            </div>
                          </div>

                          {/* Offer Message */}
                          {offer.message && (
                            <>
                              <Separator />
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Seller's Note</p>
                                <p className="text-sm text-foreground/80 leading-relaxed bg-secondary/20 p-3 rounded-lg">
                                  {offer.message}
                                </p>
                              </div>
                            </>
                          )}
                        </TabsContent>

                        <TabsContent value="actions" className="space-y-3">
                          {isBuyer ? (
                            offer.status === 'pending' ? (
                              <>
                                <Link href={`/requests/${id}/offers/${offer.id}/accept`} className="w-full">
                                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-10 font-semibold">
                                    <ThumbsUp className="w-4 h-4 mr-2" />
                                    Accept Offer
                                  </Button>
                                </Link>
                                <Link href={`/requests/${id}/offers/${offer.id}/reject`} className="w-full">
                                  <Button variant="outline" className="w-full border-red-200 hover:bg-red-50 text-red-700 h-10 font-semibold">
                                    <ThumbsDown className="w-4 h-4 mr-2" />
                                    Decline Offer
                                  </Button>
                                </Link>
                              </>
                            ) : offer.status === 'accepted' ? (
                              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                                  <p className="text-sm font-semibold text-emerald-800">Offer Accepted</p>
                                </div>
                                <p className="text-xs text-emerald-700 mb-3">Proceed to finalize the order with the seller.</p>
                                <Link href={`/messages?offer_id=${offer.id}&to=${offer.seller_id}`} className="w-full">
                                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-10 font-semibold text-sm">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Message Seller
                                  </Button>
                                </Link>
                              </div>
                            ) : (
                              <Link href={`/messages?offer_id=${offer.id}&to=${offer.seller_id}`} className="w-full">
                                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 font-semibold">
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Message Seller
                                </Button>
                              </Link>
                            )
                          ) : (
                            <Link href={`/messages?offer_id=${offer.id}&to=${offer.seller_id}`} className="w-full">
                              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 font-semibold">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                {userHasSubmittedOffer ? 'View My Offer' : 'Message Seller'}
                              </Button>
                            </Link>
                          )}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State for Sellers */}
        {isSeller && offersCount === 0 && (
          <div className="mt-12 text-center py-8 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <Card className="border-border/30 border-dashed">
              <CardContent className="pt-8 pb-8">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Offers Yet</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">This is a new request. Be the first seller to respond and stand out with a competitive offer.</p>
                <Link href={`/requests/${id}/make-offer`}>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Send className="w-4 h-4 mr-2" />
                    Submit Your Offer Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

    </div>
  );
}