import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Folder } from "@/features/folders/schemas";

interface BreadcrumbsProps {
  currentFolder?: Folder | null;
  ancestors?: Folder[];
}

// Render navigation breadcrumbs matching Google Drive header
export function Breadcrumbs({ currentFolder, ancestors = [] }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 select-none overflow-x-auto py-1 scrollbar-none">
      <Link
        href="/dashboard"
        className="drive-title shrink-0 text-2xl font-normal transition-colors hover:text-foreground"
      >
        My Drive
      </Link>
      
      {ancestors.map((ancestor) => (
        <React.Fragment key={ancestor.id}>
          <ChevronRight className="h-5 w-5 shrink-0 text-subtle mt-0.5" />
          <Link
            href={`/drive/folders/${ancestor.id}`}
            className="drive-title max-w-[200px] shrink-0 truncate text-2xl font-normal transition-colors hover:text-foreground"
            title={ancestor.name}
          >
            {ancestor.name}
          </Link>
        </React.Fragment>
      ))}

      {currentFolder && (
        <>
          <ChevronRight className="h-5 w-5 shrink-0 text-subtle mt-0.5" />
          <span className="drive-title max-w-[240px] shrink-0 truncate text-2xl font-normal text-foreground">
            {currentFolder.name}
          </span>
        </>
      )}
    </nav>
  );
}

