import Link from 'next/link';
import type { Product } from '@/lib/types';
import { ROUTES } from '@/lib/constants/routes';
import { Package, Eye, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
  showSeller?: boolean;
}

export function ProductCard({ product, showSeller = false }: ProductCardProps) {
  const imageUrl = product.images?.[0] || product.image_url || '/placeholder-product.png';
  const isActive = product.status === 'active';

  return (
    <div className="group relative rounded-2xl" style={{ isolation: 'isolate' }}>

      {/* Card shell */}
      <div
        className={[
          'relative flex flex-col h-full rounded-lg overflow-hidden',
          'border border-border/50 group-hover:border-border',
          'bg-card/60',
          ' group-hover:shadow-xl',
          'transition-all duration-500',
        ].join(' ')}
        style={{
          backdropFilter: 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        }}
      >

        {/* Image */}
        <div className="relative aspect-4/3 overflow-hidden bg-muted/30">
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Category pill — top left */}
          <div className="absolute top-3 left-3">
            <span
              className={[
                'text-[10px] uppercase tracking-[0.15em] font-semibold',
                'px-2.5 py-1 rounded-full',
                'bg-background/70 text-foreground/80',
                'border border-border/40',
              ].join(' ')}
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              {product.category}
            </span>
          </div>

          {/* View count — top right */}
          {product.views !== undefined && (
            <div
              className={[
                'absolute top-3 right-3',
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full',
                'bg-background/60 border border-border/40',
              ].join(' ')}
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <Eye className="w-3 h-3 text-muted-foreground" />
              <span className="text-[11px] font-medium text-muted-foreground">{product.views}</span>
            </div>
          )}

          {/* Inactive / sold overlay */}
          {!isActive && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-background/50"
              style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
            >
              <Badge
                variant="outline"
                className="text-sm font-semibold tracking-widest uppercase px-4 py-2 border-border bg-card/80 text-foreground"
              >
                {product.status === 'sold' ? 'Sold Out' : 'Inactive'}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4 gap-3">

          {/* Title + inventory */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold leading-snug line-clamp-2 flex-1 text-foreground tracking-tight">
              {product.title}
            </h3>

            {product.inventory_quantity !== undefined && product.inventory_quantity > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md shrink-0 mt-0.5 bg-muted/60 border border-border/50">
                <Package className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground font-medium">
                  {product.inventory_quantity}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-xs leading-relaxed line-clamp-2 text-muted-foreground">
              {product.description}
            </p>
          )}

          {/* Divider */}
          <div className="h-px bg-border/50" />

          {/* Price + CTA */}
          <div className="flex items-center justify-between gap-3 mt-auto">
            <p className="text-xl font-bold text-foreground tracking-tight leading-none">
              ${product.price.toLocaleString()}
            </p>

            <Link href={ROUTES.PRODUCT_DETAIL(product.id)}>
              <button
                className={[
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-xl',
                  'text-xs font-semibold tracking-wide',
                  'bg-primary/10 hover:bg-primary/20',
                  'border border-primary/20 hover:border-primary/40',
                  'text-primary',
                  'hover:-translate-y-px hover:shadow-md',
                  'transition-all duration-300',
                ].join(' ')}
                style={{
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                View
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300" />
              </button>
            </Link>
          </div>
        </div>

        {/* Subtle top specular line */}
        <div className="absolute top-0 inset-x-0 h-px bg-border/30 pointer-events-none" />
      </div>
    </div>
  );
}