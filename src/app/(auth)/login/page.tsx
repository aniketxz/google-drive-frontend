"use client";

import { ProductLogo } from "@/components/brand/product-logo";
import { Wordmark } from "@/components/brand/wordmark";
import { GoogleLogo } from "@/components/brand/google-logo";
import { env } from "@/lib/env";
import { APP_ROUTES } from "@/constants";

// Unauthenticated user login entry page
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md rounded-3xl bg-surface p-8 shadow-dialog border border-outline-soft">
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <ProductLogo className="h-12 w-12 text-primary" />
          <Wordmark className="text-xl font-bold text-foreground" />
          <p className="text-sm text-foreground/85 font-medium">
            Secure API-aligned cloud storage client
          </p>
        </div>

        <a
          href={`${env.NEXT_PUBLIC_API_BASE_URL}${APP_ROUTES.AUTH_GOOGLE}`}
          className="flex w-full items-center justify-center gap-3 rounded-full bg-primary hover:bg-primary-hover px-5 py-3 text-sm font-semibold text-white transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          <GoogleLogo className="h-5 w-5" />
          <span>Continue with Google</span>
        </a>

        <div className="mt-8 text-center text-xs text-muted-foreground font-normal">
          By signing in, you agree to the local storage session policies.
        </div>
      </div>
    </div>
  );
}
