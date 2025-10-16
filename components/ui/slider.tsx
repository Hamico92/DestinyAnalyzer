import * as React from "react";
export function Slider({ value, min=0, max=100, step=1, onValueChange } : { value: number[]; min?: number; max?: number; step?: number; onValueChange: (v:number[])=>void }){
  const [v, setV] = React.useState(value[0] ?? 0);
  React.useEffect(()=>{ setV(value[0] ?? 0); }, [value]);
  return (
    <input type="range" min={min} max={max} step={step} value={v}
      onChange={(e)=>{ const n = Number(e.target.value); setV(n); onValueChange([n]); }}
      className="w-full"
    />
  );
}
