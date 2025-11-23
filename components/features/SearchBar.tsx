"use client";

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchBar({
  placeholder = 'Search...',
  defaultValue = '',
  onSearch,
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else {
      // Default behavior: navigate to products page with search query
      router.push(`/products?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex gap-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-3 h-10 bg-transparent border-border rounded-md focus-visible:ring-0 focus-visible:border-foreground"
        />
      </div>
      <Button
        type="submit"
        variant="default"
        className="shadow-none"
      >
        <Search className="w-4 h-4 sm:hidden" />
        <span className="hidden sm:inline">Search</span>
      </Button>
    </form>
  );
}
