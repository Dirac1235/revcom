import { Suspense } from "react";
import { LoadingState } from "@/components/features/LoadingState";
import { ListingsContent } from "@/components/requests/ListingContent";

export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center ">
          <LoadingState count={1} type="card" />
        </div>
      }
    >
      <ListingsContent />
    </Suspense>
  );
}
