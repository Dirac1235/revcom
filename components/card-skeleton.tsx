import { Card, CardContent, CardHeader } from "./ui/card";

const SkeletonCard = () => (
  <Card className="animate-pulse border-blue-100 dark:border-blue-900/50 bg-white/90 dark:bg-slate-800/90">
    <CardHeader>
      <div className="h-6 bg-blue-200 dark:bg-blue-800 rounded w-3/4"></div>
      <div className="h-4 bg-blue-100 dark:bg-blue-900 rounded w-1/2 mt-2"></div>
    </CardHeader>
    <CardContent>
      <div className="h-8 bg-blue-200 dark:bg-blue-800 rounded w-2/3"></div>
      <div className="h-4 bg-blue-100 dark:bg-blue-900 rounded w-1/3 mt-3"></div>
      <div className="h-10 bg-blue-600 dark:bg-blue-500 rounded mt-4"></div>
    </CardContent>
  </Card>
);
export default SkeletonCard;  