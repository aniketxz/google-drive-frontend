import * as React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DisabledFeatureTooltip } from "./disabled-feature-tooltip";

interface DriveNavItemProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  badge?: string;
  nested?: boolean;
  onClick?: () => void;
}

// Side navigation pill component
export function DriveNavItem({
  icon: Icon,
  label,
  href,
  active = false,
  disabled = false,
  badge,
  nested = false,
  onClick,
}: DriveNavItemProps) {
  const content = (
    <>
      <span className="drive-nav-icon">
        <Icon className="size-4" />
      </span>
      <span className="drive-nav-label font-medium flex-1 text-sm">{label}</span>
      {badge && (
        <span className="rounded bg-surface-high px-1.5 py-0.5 text-xs text-foreground font-medium">
          {badge}
        </span>
      )}
    </>
  );

  const className = cn(
    "drive-nav-item",
    nested && "pl-8"
  );

  if (disabled) {
    return (
      <DisabledFeatureTooltip content="Not available yet">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className={className}
        >
          {content}
        </button>
      </DisabledFeatureTooltip>
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={className}
        data-active={active ? "true" : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      data-active={active ? "true" : undefined}
    >
      {content}
    </button>
  );
}
