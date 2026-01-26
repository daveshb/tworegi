"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchAssociatesProps {
  onSearch: (results: any[]) => void;
  onLoading?: (loading: boolean) => void;
}

export default function SearchAssociates({
  onSearch,
  onLoading,
}: SearchAssociatesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Debounce function
  const debounce = useCallback(
    (callback: (value: string) => void, delay: number = 500) => {
      let timeoutId: NodeJS.Timeout;

      return (value: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          callback(value);
        }, delay);
      };
    },
    []
  );

  // Search function
  const performSearch = useCallback(async (query: string) => {
    try {
      setIsSearching(true);
      onLoading?.(true);

      const response = await fetch(
        `/api/associates?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error("Failed to search associates");
      }

      const data = await response.json();
      onSearch(data.data || []);
    } catch (error) {
      console.error("Search error:", error);
      onSearch([]);
    } finally {
      setIsSearching(false);
      onLoading?.(false);
    }
  }, [onSearch, onLoading]);

  // Create debounced search
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      if (value.trim()) {
        performSearch(value);
      } else {
        // Si el search está vacío, mostrar todos
        performSearch("");
      }
    }, 500),
    [debounce, performSearch]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setSearchTerm("");
    performSearch("");
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, email, or cedula..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {isSearching && (
        <p className="text-xs text-muted-foreground mt-1">Searching...</p>
      )}
    </div>
  );
}
