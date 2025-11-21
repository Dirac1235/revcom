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
    <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-blue-100 dark:border-blue-900/50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm overflow-hidden">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {product.status !== 'active' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Badge variant="secondary" className="text-white bg-gray-800">
              {product.status === 'sold' ? 'Sold Out' : 'Inactive'}
            </Badge>
          </div>
        )}
        {product.views !== undefined && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <Eye className="w-3 h-3 text-white" />
            <span className="text-xs text-white">{product.views}</span>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg text-blue-600 dark:text-blue-400 line-clamp-2 flex-1">
            {product.title}
          </CardTitle>
          {product.inventory_quantity !== undefined && product.inventory_quantity > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 text-xs flex items-center gap-1">
              <Package className="w-3 h-3" />
              {product.inventory_quantity}
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm">
          {product.category}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">
          ${product.price.toLocaleString()}
        </p>
        
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {product.description}
          </p>
        )}

        <div className="flex gap-2">
          <Link href={ROUTES.PRODUCT_DETAIL(product.id)} className="flex-1">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/30 transition-all group-hover:shadow-lg">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
