import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({ className, variant = "default", ...props } : React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "secondary" | "destructive" }) {
  const variants: Record<string, string> = {
    default: "bg-black text-white hover:bg-black/90",
    outline: "border border-neutral-300 hover:bg-neutral-100",
    secondary: "bg-neutral-200 hover:bg-neutral-300",
    destructive: "bg-red-600 text-white hover:bg-red-700"
  };
  return <button className={cn("px-4 py-2 rounded-xl text-sm transition", variants[variant], className)} {...props} />;
}
