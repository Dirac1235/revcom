import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ThumbsUp,
  Medal,
  ShieldCheck,
  MoreVertical,
  Edit,
  Trash2,
  Reply,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StarRating } from "./StarRating";
import type { ReviewWithDetails } from "@/lib/types";

interface ReviewCardProps {
  review: ReviewWithDetails;
  currentUserId?: string;
  isSellerView?: boolean;
  onEdit?: (review: ReviewWithDetails) => void;
  onDelete?: (reviewId: string) => void;
  onHelpful?: (reviewId: string) => void;
  onRespond?: (review: ReviewWithDetails) => void;
  helpfulVoted?: boolean;
}

export function ReviewCard({
  review,
  currentUserId,
  isSellerView = false,
  onEdit,
  onDelete,
  onHelpful,
  onRespond,
  helpfulVoted = false,
}: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isOwner = currentUserId === review.buyer_id;
  const hasComment = !!review.comment;

  const buyerName = review.buyer
    ? `${review.buyer.first_name || ""} ${review.buyer.last_name || ""}`.trim() ||
      "User"
    : "Anonymous Buyer";

  const avatarUrl = review.buyer?.avatar_url;

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border bg-muted">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={buyerName} />
            ) : (
              <AvatarFallback>{buyerName[0] || "A"}</AvatarFallback>
            )}
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link href={`/users/${review.buyer_id}`} className="font-semibold text-sm leading-none hover:underline">
                {buyerName}
              </Link>
              {review.verified_purchase && (
                <Badge
                  variant="secondary"
                  className="px-1.5 py-0 h-5 text-[10px] bg-green-100 text-green-800 border-green-200"
                >
                  <ShieldCheck className="w-3 h-3 mr-1" /> Verified Purchase
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <StarRating rating={review.rating} size="sm" />
              <span>•</span>
              <time dateTime={review.created_at}>
                {formatDistanceToNow(new Date(review.created_at), {
                  addSuffix: true,
                })}
              </time>
            </div>
          </div>
        </div>

        {(isOwner || isSellerView) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner && onEdit && (
                <DropdownMenuItem onClick={() => onEdit(review)}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Edit Review</span>
                </DropdownMenuItem>
              )}
              {isOwner && onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(review.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              )}
              {isSellerView && onRespond && (
                <DropdownMenuItem onClick={() => onRespond(review)}>
                  <Reply className="mr-2 h-4 w-4" />
                  <span>{review.seller_response ? "Edit Response" : "Respond"}</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {hasComment && (
          <div className="text-sm">
            <p
              className={
                !isExpanded && review.comment!.length > 200
                  ? "line-clamp-3"
                  : ""
              }
            >
              {review.comment}
            </p>
            {review.comment!.length > 200 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-primary text-xs font-medium hover:underline mt-1"
              >
                {isExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        {review.seller_response && (
          <div className="bg-muted/50 border-l-2 border-primary p-3 mt-4 rounded-r-md text-sm">
            <div className="font-semibold mb-1 flex items-center gap-2">
              <Medal className="h-4 w-4 text-primary" />
              Seller Response
            </div>
            <p className="text-muted-foreground">{review.seller_response}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          variant="outline"
          size="sm"
          className={`h-8 ${helpfulVoted ? "text-primary border-primary/30" : "text-muted-foreground hover:text-foreground"}`}
          onClick={() => onHelpful?.(review.id)}
          disabled={helpfulVoted}
        >
          <ThumbsUp className={`h-4 w-4 mr-2 ${helpfulVoted ? "fill-primary" : ""}`} />
          {helpfulVoted ? "Marked Helpful" : "Helpful"} ({review.helpful_count || 0})
        </Button>
      </CardFooter>
    </Card>
  );
}
