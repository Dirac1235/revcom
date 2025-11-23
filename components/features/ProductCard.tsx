import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { ROUTES } from '@/lib/constants/routes';
import { Package, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  showSeller?: boolean;
}

export function ProductCard({ product, showSeller = false }: ProductCardProps) {
  const imageUrl = product.images?.[0] || product.image_url || '/placeholder-product.png';
  
  return (
    <Card className="group hover:border-foreground/20 transition-colors duration-300 border-border bg-card overflow-hidden rounded-lg">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary/20">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.status !== 'active' && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <Badge variant="secondary" className="bg-foreground text-background">
              {product.status === 'sold' ? 'Sold Out' : 'Inactive'}
            </Badge>
          </div>
        )}
        {product.views !== undefined && (
          <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5 border border-border">
            <Eye className="w-3 h-3 text-foreground" />
            <span className="text-xs font-medium">{product.views}</span>
          </div>
        )}
      </div>

      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-base font-medium text-foreground line-clamp-2 flex-1 leading-snug">
            {product.title}
          </CardTitle>
          {product.inventory_quantity !== undefined && product.inventory_quantity > 0 && (
            <Badge variant="outline" className="text-xs flex items-center gap-1 font-normal shrink-0">
              <Package className="w-3 h-3" />
              {product.inventory_quantity}
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs uppercase tracking-wider font-medium text-muted-foreground pt-1">
          {product.category}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0 px-4 pb-4">
        <p className="text-lg font-serif font-bold text-foreground mb-3">
          ${product.price.toLocaleString()}
        </p>
        
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="flex gap-2">
          <Link href={ROUTES.PRODUCT_DETAIL(product.id)} className="flex-1">
            <Button variant="outline" className="w-full hover:bg-foreground hover:text-background transition-colors">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
