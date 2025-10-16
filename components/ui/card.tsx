import { cn } from "@/lib/utils";
export function Card({ className, ...props } : React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("bg-white border border-neutral-200 rounded-2xl", className)} {...props} />;
}
export function CardContent({ className, ...props } : React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}
