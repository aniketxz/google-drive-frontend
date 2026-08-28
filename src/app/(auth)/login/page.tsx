"use client";

import { ProductLogo } from "@/components/brand/product-logo";
import { Wordmark } from "@/components/brand/wordmark";
import { env } from "@/lib/env";

// Unauthenticated user login entry page
export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = `${env.NEXT_PUBLIC_API_BASE_URL}/auth/google`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md rounded-3xl bg-surface p-8 shadow-dialog border border-outline-soft">
        <div className="flex flex-col items-center gap-2 mb-8">
          <ProductLogo className="h-12 w-12 text-primary" />
          <Wordmark className="text-xl font-bold text-foreground" />
          <p className="text-sm text-muted">
            Secure API-aligned cloud storage client
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-full bg-primary hover:bg-primary-hover px-5 py-3 text-sm font-semibold text-on-primary transition-all"
        >
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.99 5.99 0 0 1 8 12.5a5.99 5.99 0 0 1 5.99-6.012c1.49 0 2.846.554 3.882 1.467l3.076-3.078C19.066 3.1 16.634 2 13.99 2 8.473 2 4 6.473 4 11.99s4.473 10 9.99 10c5.762 0 9.99-4.048 9.99-10 0-.677-.08-1.32-.225-1.705H12.24Z" />
          </svg>
          Continue with Google
        </button>

        <div className="mt-8 text-center text-xs text-subtle">
          By signing in, you agree to the local storage session policies.
        </div>
      </div>
    </div>
  );
}
