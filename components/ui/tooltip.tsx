import * as React from "react";
export function TooltipProvider({ children }:{ children: React.ReactNode }){ return <>{children}</>; }
export function Tooltip({ children }:{ children: React.ReactNode }){ return <>{children}</>; }
export function TooltipTrigger({ children }:{ children: React.ReactNode }){ return <span className="inline-flex items-center">{children}</span>; }
export function TooltipContent({ children }:{ children: React.ReactNode }){ return <span className="ml-2 text-xs text-neutral-500">{children}</span>; }
