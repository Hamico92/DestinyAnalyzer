import { cn } from "@/lib/utils";
export function Badge({ className, variant = "default", ...props } : React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "outline" | "destructive" }) {
  const variants: Record<string,string> = {
    default: "bg-black text-white",
    outline: "border border-neutral-300",
    destructive: "bg-red-600 text-white"
  };
  return <span className={cn("inline-flex items-center px-2 py-1 rounded-md text-xs", variants[variant], className)} {...props} />;
}
