"use client";
import * as React from "react";

type Ctx = { value: string; setValue: (v:string)=>void };
const TabsCtx = React.createContext<Ctx | null>(null);

export function Tabs({ defaultValue, className, children } : { defaultValue: string; className?: string; children: React.ReactNode }){
  const [value, setValue] = React.useState(defaultValue);
  return <div className={className}><TabsCtx.Provider value={{value, setValue}}>{children}</TabsCtx.Provider></div>;
}

export function TabsList({ children, className } : { children: React.ReactNode; className?: string }){
  return <div className={"flex gap-2 "+(className||"")}>{children}</div>;
}

export function TabsTrigger({ value, children } : { value: string; children: React.ReactNode }){
  const ctx = React.useContext(TabsCtx)!;
  const active = ctx.value === value;
  return <button onClick={()=>ctx.setValue(value)} className={"px-3 py-2 rounded-xl text-sm border "+(active?"bg-black text-white border-black":"border-neutral-300")}>{children}</button>;
}

export function TabsContent({ value, children } : { value: string; children: React.ReactNode }){
  const ctx = React.useContext(TabsCtx)!;
  if (ctx.value !== value) return null;
  return <div className="mt-4">{children}</div>;
}
