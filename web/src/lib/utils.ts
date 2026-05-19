import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names while resolving conflicts.
 * shadcn convention — `cn("bg-red-500", isActive && "bg-blue-500")` keeps the active one.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
