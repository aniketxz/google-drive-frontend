"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";

function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [inputValue, setInputValue] = React.useState(query);

  const [prevQuery, setPrevQuery] = React.useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setInputValue(query);
  }

  const handleSearch = (term: string) => {
    const nextPath = term ? `/dashboard?q=${encodeURIComponent(term)}` : `/dashboard`;
    router.push(nextPath);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(inputValue);
    }
  };

  const handleClear = () => {
    setInputValue("");
    router.push("/dashboard");
  };

  return (
    <div className="drive-search">
      <Search className="size-4 shrink-0" />
      <input
        type="text"
        placeholder="Search in Drive"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {inputValue && (
        <button
          onClick={handleClear}
          className="rounded-full p-1 transition-colors hover:bg-surface-highest"
          aria-label="Clear search"
        >
          <X className="size-3" />
        </button>
      )}
      {!inputValue && <SlidersHorizontal className="size-4 shrink-0" aria-hidden="true" />}
    </div>
  );
}

// Wrap search in Suspense for Next.js App Router safety
export function DriveSearch() {
  return (
    <React.Suspense fallback={<div className="drive-search w-full" />}>
      <SearchInput />
    </React.Suspense>
  );
}
