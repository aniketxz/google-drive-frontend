"use client";

import * as React from "react";
import { ProductLogo } from "@/components/brand/product-logo";
import { Wordmark } from "@/components/brand/wordmark";
import { DriveSearch } from "./drive-search";
import { ThemeMenu } from "./theme-menu";
import { Menu, HelpCircle, Settings, Sparkles, Grid3X3 } from "lucide-react";
import { useDriveUiStore } from "@/stores/drive-ui-store-provider";
import { selectSidebarOpen } from "@/stores/selectors";

interface UserData {
  name: string;
  email: string;
  avatar?: string;
}

interface DriveTopbarProps {
  user?: UserData | null;
  onLogout?: () => void;
}

// Global top navigation header matching Google Drive exactly
export function DriveTopbar({ user, onLogout }: DriveTopbarProps) {
  const sidebarOpen = useDriveUiStore(selectSidebarOpen);
  const setSidebarOpen = useDriveUiStore((state) => state.setSidebarOpen);
  const [avatarError, setAvatarError] = React.useState(false);

  const getInitials = (name?: string) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 1);
  };

  return (
    <header className="drive-topbar items-center">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="drive-topbar-action md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="drive-brand cursor-pointer">
          <ProductLogo className="h-9 w-9 text-primary" />
          <Wordmark className="drive-brand-label text-xl font-normal text-foreground" />
        </div>
      </div>

      <div className="min-w-0 w-full max-w-3xl md:mx-auto flex items-center self-center my-auto">
        <DriveSearch />
      </div>

      <div className="flex items-center justify-end gap-1.5 md:gap-2">
        <ThemeMenu />

        <button
          className="drive-topbar-action hidden sm:flex"
          title="Support / Help"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        <button
          className="drive-topbar-action hidden sm:flex"
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </button>

        <button
          className="drive-topbar-action text-amber-500 hover:text-amber-600 hidden sm:flex"
          title="Gemini AI"
        >
          <Sparkles className="h-5 w-5 fill-amber-400/20 text-amber-500" />
        </button>

        <button
          className="bg-primary-container hover:bg-primary/20 text-on-primary-container font-medium text-xs md:text-sm px-4 py-2 rounded-full transition-colors hidden md:inline-flex items-center justify-center shadow-xs"
          title="Upgrade Storage"
        >
          Upgrade
        </button>

        <button
          className="drive-topbar-action"
          title="Google apps"
        >
          <Grid3X3 className="h-5 w-5" />
        </button>

        {user ? (
          <div className="relative group">
            <button
              className="h-8 w-8 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center text-sm shadow-xs transition-transform hover:scale-105"
              aria-label="Open account menu"
            >
              {!avatarError && user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  onError={() => setAvatarError(true)}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span>{getInitials(user.name)}</span>
              )}
            </button>
            
            <div className="drive-account-menu group-focus-within:opacity-100 group-focus-within:pointer-events-auto group-hover:opacity-100 group-hover:pointer-events-auto">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                <p className="truncate text-xs text-foreground/85 font-medium mt-0.5">{user.email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={onLogout}
                  className="w-full rounded px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-surface-low font-medium"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center text-sm">
            A
          </div>
        )}
      </div>
    </header>
  );
}

