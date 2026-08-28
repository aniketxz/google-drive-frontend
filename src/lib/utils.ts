import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind and conditional CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
