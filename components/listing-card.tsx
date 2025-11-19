import { Badge } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Link from "next/link";
import { Button } from "./ui/button";

export default function ListingCard({ l, userId }: { l: any, userId: string | null }) {
  return (
    <Card
      key={l.id}
      className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-blue-100 dark:border-blue-900/50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm overflow-hidden"
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg text-blue-600 dark:text-blue-400 line-clamp-2">
            {l.title}
          </CardTitle>
          {l.buyer_id === userId && (
            <Badge className="bg-blue-600 text-white text-xs">Yours</Badge>
          )}
        </div>
        <CardDescription className="text-sm">
          {l.category || "Uncategorized"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {l.budget_min && l.budget_max
            ? `$${l.budget_min.toLocaleString()} - $${l.budget_max.toLocaleString()}`
            : "Budget not specified"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Status:{" "}
          <span className="font-medium capitalize text-green-600 dark:text-green-400">
            {l.status ?? "open"}
          </span>
        </p>
        <div className="mt-4">
          <Link href={`/listings/${l.id}`}>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/30 transition-all group-hover:shadow-lg">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
