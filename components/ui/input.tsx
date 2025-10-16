import * as React from "react";
import { cn } from "@/lib/utils";
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn("w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400", className)} {...props} />
  )
);
Input.displayName = "Input";
