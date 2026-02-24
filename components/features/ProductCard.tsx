import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { ROUTES } from '@/lib/constants/routes';
import { Package, Eye, ArrowUpRight, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  showSeller?: boolean;
}

export function ProductCard({ product, showSeller = false }: ProductCardProps) {
  const imageUrl = product.images?.[0] || product.image_url || '/placeholder-product.png';
  const isActive = product.status === 'active';

  return (
    <Link href={ROUTES.PRODUCT_DETAIL(product.id)} className="h-full">
      <Card className="group flex flex-col overflow-hidden rounded-xl border-border/50 bg-card/60 p-0 shadow-none [backdrop-filter:blur(20px)_saturate(150%)] transition-all duration-500 hover:border-border hover:shadow-xl cursor-pointer h-full">

        {/* Subtle top specular line */}
        <div className="absolute top-0 inset-x-0 h-px bg-border/30 pointer-events-none" />

        {/* Image */}
        <div className="relative aspect-4/3 overflow-hidden bg-muted/30">
          <img
            src={imageUrl}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Category pill */}
          <Badge
            variant="outline"
            className="absolute top-3 left-3 rounded-full border-border/40 bg-background/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-foreground/80 [backdrop-filter:blur(10px)]"
          >
            {product.category}
          </Badge>

          {/* View count */}
          {product.views !== undefined && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full border border-border/40 bg-background/60 px-2.5 py-1 [backdrop-filter:blur(10px)]">
              <Eye className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] font-medium text-muted-foreground">{product.views}</span>
            </div>
          )}

          {/* Sold out / inactive overlay */}
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 [backdrop-filter:blur(4px)]">
              <Badge variant="outline" className="border-border bg-card/80 px-4 py-2 text-sm font-semibold uppercase tracking-widest text-foreground">
                {product.status === 'sold' ? 'Sold Out' : 'Inactive'}
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="gap-2 px-4 pt-4 pb-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="flex-1 text-sm font-semibold leading-snug tracking-tight text-foreground line-clamp-2">
              {product.title}
            </h3>

            {product.inventory_quantity !== undefined && product.inventory_quantity > 0 && (
              <Badge variant="outline" className="mt-0.5 shrink-0 gap-1 border-border/50 bg-muted/60 text-[11px] font-medium text-muted-foreground">
                <Package className="h-3 w-3" />
                {product.inventory_quantity}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-3 px-4 pt-3 pb-4">
          {product.description && (
            <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}

          {(product.average_rating ?? 0) > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < Math.round(product.average_rating!) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30 fill-transparent"}`}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-foreground">
                {Number(product.average_rating).toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({product.review_count})
              </span>
            </div>
          )}

          <div className="h-px bg-border/50" />

          <div className="mt-auto flex items-center justify-between gap-3">
            <p className="text-xl font-bold leading-none tracking-tight text-foreground">
              {product.price.toLocaleString()} ETB
            </p>

            {/* Icon hint */}
            <div className="text-primary/60 group-hover:text-primary transition-colors">
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}