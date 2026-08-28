"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

// Display screen for OAuth failure fallbacks
export default function AuthFailurePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md rounded-3xl bg-surface p-8 shadow-dialog border border-outline-soft text-center">
        <div className="flex justify-center mb-4 text-red-500">
          <AlertCircle className="h-12 w-12" />
        </div>
        <h1 className="text-xl font-semibold mb-2">Authentication Failed</h1>
        <p className="text-sm text-muted mb-6">
          Google OAuth login was not successful. Please try again.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary-hover transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
