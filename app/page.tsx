import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Download, Wand2, LineChart, Sigma, Info, Rocket, FlaskConical, BookOpen } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip as ReTooltip } from "recharts";

// ------------------------------------------------------------
// Destiny Ψ Analyzer — single-file React app (Vercel-friendly)
// Notes:
// - Drop this component into a Next.js page (e.g., app/page.tsx) or a Vite app.
// - Uses shadcn/ui & lucide-react & recharts (assumed available in environment).
// - TailwindCSS utility classes for styling.
// - This app operationalizes the speculative "Ψ(t)" framework.
// - Not scientific advice. For reflection & journaling only.
// ------------------------------------------------------------

// ---------- Types ----------
 type Params = {
  P: 0 | 1;              // overthinking bit
  delta: number;         // δ(i,j)
  sgnD: number;          // sgn(D)
  absD: number;          // |D|
  K: number;             // K(D)
  xi: number;            // ξ(t)
  CN: number;            // C(N)
  B: number;             // B(t)
  J: number;             // J(t)
  Omega: number;         // Ω (radians per day)
  tDays: number;         // time in days (relative)
 };

 type BreakdownRow = { key: string; value: number; hint: string };

// ---------- Utilities ----------
function clamp(num: number, min: number, max: number) { return Math.min(max, Math.max(min, num)); }

function complexMul(a:{re:number, im:number}, b:{re:number, im:number}){ return { re: a.re*b.re - a.im*b.im, im: a.re*b.im + a.im*b.re }; }

function complexExpMinusI(theta:number){ return { re: Math.cos(theta), im: -Math.sin(theta) }; }

function mag(z:{re:number, im:number}){ return Math.hypot(z.re, z.im); }

function phase(z:{re:number, im:number}){ return Math.atan2(z.im, z.re); }

// Heuristic NLP-ish parsing — deliberately simple/transparent.
function parsePromptToParams(prompt: string): Partial<Params> {
  const text = (prompt || "").toLowerCase();

  // P (overthinking): keywords that suggest rumination/analysis paralysis
  const pKeywords = ["non riesco", "ansia", "penso troppo", "overthinking", "blocco", "paralisi", "riscrivo", "continuo a pensare", "non decido", "paura", "procrastino", "cerco consigli", "ho riscritto"];
  const P: 0 | 1 = pKeywords.some(k => text.includes(k)) ? 1 : 0;

  // sgn(D): direction — look for polarity cues
  const negCues = ["sabot", "evito", "rinvio", "lamento", "litigo", "rompo", "odio", "scappo", "rinuncio"];
  const posCues = ["costruire", "migliorare", "chiedo", "propongo", "avvio", "studio", "investo", "collaboro", "aiuto", "lancio", "presento", "applico", "partecipo"];
  let polarity = 0;
  if (negCues.some(k => text.includes(k))) polarity -= 1;
  if (posCues.some(k => text.includes(k))) polarity += 1;
  const sgnD = clamp(polarity, -1, 1);

  // |D|: intensity — crude proxy from verbs & numbers
  const intensityHints = (text.match(/(subito|oggi|adesso|ogni giorno|tutti i giorni|100|molto|forte|spesso|urgente|domani|settimana)/g) || []).length;
  const absD = clamp(2 + intensityHints * 0.6, 0, 10); // base 2, scale up

  // δ(i,j): if relational/professional counterparts are mentioned
  const hasOther = /(lei|lui|socia|socio|cliente|partner|capo|team|fornitore|investitore|amico|amica)/.test(text);
  const delta = hasOther ? 0.5 : 0.2;

  // K(D): amplify based on sgn/absD, with small history nudge if "promessa", "completo"
  const kept = (text.match(/promessa mantenuta|completat[oa]|finito|conclus[oa]/g) || []).length;
  const broken = (text.match(/promessa rott[ae]|rinvio|saltato|mancat[oa]/g) || []).length;
  const history = kept * 0.2 - broken * 0.3;
  const K = clamp(1 + 0.1 * sgnD * absD * absD + 0.01 * history, 0.1, 12);

  // ξ(t): count serendipity/sync words
  const xiHits = (text.match(/cas[ou]l|sincr|coincidenza|fortuna|tempismo|a caso|allineament[oi]|segn[o|ali]/g) || []).length;
  const xi = clamp(0.2 + xiHits * 0.3, 0, 5);

  // C(N): network influence — look for group/team/social cues
  const groupHits = (text.match(/team|gruppo|famiglia|amici|community|forum|reddit|telegram|facebook|social|clienti/g) || []).length;
  const CN = clamp( (groupHits ? 0.03 * groupHits : 0) * (text.includes("support") || text.includes("aiut") ? 1 : (text.includes("critica") || text.includes("scoragg") ? -1 : 1)), -1, 1);

  // B(t): urgency/uncertainty/options cues
  let B = 1.0;
  if (/bivio|critico|decisiv[ao]|urgenza|scelta|molte opzioni|non so|incertezza/.test(text)) B += 2.0;
  if (/entro|scadenza|24 ore|settimana|mese|domani|oggi/.test(text)) B += 1.0;
  B = clamp(B, 0, 8);

  // J(t): explicit sync references boost
  const J = clamp( (text.match(/11:11|sogno|stesso momento|stessa canzone|segno|presagio|deja vu|déjà vu/g) || []).length * 0.7, 0, 10);

  // Ω & t: derive from cyclicity words; default: 2π/28 rad/day; user can tweak with slider
  const Omega = 2 * Math.PI / 28; // 28-day baseline cycle
  const tDays = 0; // start at 0; user adjusts

  return { P, sgnD, absD, delta, K, xi, CN, B, J, Omega, tDays };
}

function computePsi(params: Params){
  const { P, delta, sgnD, absD, K, Omega, tDays, xi, CN, B, J } = params;
  // Σ[...] — in this simplified engine we treat it as a single aggregated contribution
  const inversion = Math.pow(-1, P); // (-1)^P
  const decisionTerm = sgnD * absD * K; // sgn(D)·|D|·K(D)
  const sumBracket = inversion * delta + decisionTerm; // δ term plus decision influence
  const rot = complexExpMinusI(Omega * tDays); // e^{-iΩt}
  const base = { re: sumBracket * rot.re, im: sumBracket * rot.im };
  const noiseCollective = xi * CN * (1 + B * J); // ξ(t)·C(N)·[1 + B·J]
  return { re: base.re + noiseCollective, im: base.im }; // noiseCollective is real-valued here
}

function fmt(n:number, d=3){ return Number.isFinite(n) ? n.toFixed(d) : "–"; }

// Advice generator driven by parameters
function generateAdvice(p: Params){
  const tips: { pros: string[]; cons: string[]; actions: string[] } = { pros: [], cons: [], actions: [] };
  if (p.P === 0) tips.pros.push("Energia non invertita: buona base per agire");
  else { tips.cons.push("Overthinking rilevato: rischio di inversione degli esiti"); tips.actions.push("Imposta finestre di azione di 25 minuti e un 'tempo di pensiero' programmato"); }

  if (p.sgnD > 0) tips.pros.push("Direzione decisionale costruttiva");
  if (p.sgnD < 0) { tips.cons.push("Pattern di auto-sabotaggio/evitamento"); tips.actions.push("Sostituisci 1 azione negativa con 1 micro-azione costruttiva oggi"); }

  if (p.absD < 3) tips.actions.push("Aumenta l'intensità: esegui 1 azione di livello ≥4 entro 24h");
  else tips.pros.push("Intensità sufficiente per spostare l'ago della bilancia");

  if (p.K > 1) tips.pros.push("Amplificazione karmica positiva in corso");
  if (p.K < 1) tips.actions.push("Rimedia a 1 promessa rotta, completa 1 task aperto: rialza K(D)");

  if (p.delta < 0.4) tips.actions.push("Aumenta δ(i,j): proponi interazione concreta e reciproca");
  else tips.pros.push("Buona sincronia/reciprocità percepita");

  if (p.CN < 0) { tips.cons.push("Influenza di network negativa"); tips.actions.push("Riduci esposizione a fonti tossiche di -50% per 7 giorni, aggiungi 1 mentor +"); }
  if (p.J > 2) tips.pros.push("Pattern di sincronicità rilevanti: sfrutta il momentum");

  if (p.B >= 3) tips.actions.push("Siamo in biforcazione: applica regola 'slow is smooth, smooth is fast' prima di impegnarti");

  return tips;
}

// Example presets (4 slots). Example 1 is filled based on a detailed scenario.
const PRESETS: Record<string, Params> = {
  "Esempio 1 — Daniele & Sofia": {
    P: 1,
    delta: 0.44,
    sgnD: -0.57,
    absD: 1.07,
    K: 0.87,
    xi: 0.15,
    CN: -0.046,
    B: 3.94,
    J: 2.5,
    Omega: 2*Math.PI/28,
    tDays: 21,
  },
  "Esempio 2 — Carriera (placeholder)": {
    P: 0,
    delta: 0.35,
    sgnD: 0.4,
    absD: 5.2,
    K: 2.8,
    xi: 0.6,
    CN: 0.12,
    B: 2.2,
    J: 1.0,
    Omega: 2*Math.PI/33,
    tDays: 46,
  },
  "Esempio 3 — Startup (placeholder)": {
    P: 0,
    delta: 0.5,
    sgnD: 0.7,
    absD: 6.5,
    K: 3.6,
    xi: 0.9,
    CN: 0.2,
    B: 4.4,
    J: 1.8,
    Omega: 2*Math.PI/58,
    tDays: 120,
  },
  "Esempio 4 — Benessere (placeholder)": {
    P: 0,
    delta: 0.3,
    sgnD: 0.2,
    absD: 4.0,
    K: 1.6,
    xi: 0.5,
    CN: 0.05,
    B: 1.1,
    J: 0.6,
    Omega: 2*Math.PI/23,
    tDays: 12,
  },
};

export default function DestinyPsiAnalyzer(){
  const [prompt, setPrompt] = useState("");
  const [params, setParams] = useState<Params>({ P:0, delta:0.2, sgnD:0, absD:2, K:1, xi:0.2, CN:0, B:1, J:0, Omega:2*Math.PI/28, tDays:0 });
  const [rows, setRows] = useState<BreakdownRow[]>([]);

  useEffect(()=>{
    const r: BreakdownRow[] = [
      { key: "(-1)^P", value: Math.pow(-1, params.P), hint: "Inversione da overthinking (0→+1, 1→-1)" },
      { key: "δ(i,j)", value: params.delta, hint: "Connessione/sincronicità interpersonale" },
      { key: "sgn(D)", value: params.sgnD, hint: "Direzione etica/funzionale della decisione" },
      { key: "|D|", value: params.absD, hint: "Intensità della decisione" },
      { key: "K(D)", value: params.K, hint: "Amplificazione/karma delle azioni" },
      { key: "e^{-iΩt} (Re)", value: Math.cos(params.Omega*params.tDays), hint: "Oscillatore ciclico (componente reale)" },
      { key: "e^{-iΩt} (Im)", value: -Math.sin(params.Omega*params.tDays), hint: "Oscillatore ciclico (componente immaginaria)" },
      { key: "ξ(t)", value: params.xi, hint: "Casualità/serendipità percepita" },
      { key: "C(N)", value: params.CN, hint: "Influenza del network (−1↔+1)" },
      { key: "B(t)", value: params.B, hint: "Criticità/biforcazione del momento" },
      { key: "J(t)", value: params.J, hint: "Indice di sincronicità junghiana" },
    ];
    setRows(r);
  }, [params]);

  const psi = useMemo(()=>computePsi(params), [params]);
  const psiMag = mag(psi);
  const psiPhase = phase(psi); // radians
  const psiProbDensity = psiMag*psiMag; // |Ψ|^2

  const tips = useMemo(()=>generateAdvice(params), [params]);

  const radarData = [
    { metric: "Connessione δ", value: clamp(params.delta, 0, 1) },
    { metric: "Intensità |D|", value: params.absD / 10 },
    { metric: "Direzione sgn(D)", value: (params.sgnD+1)/2 },
    { metric: "K(D)", value: clamp(params.K/6, 0, 1) },
    { metric: "Î\xCE¾\xCE\xBE(t)", value: clamp(params.xi/5, 0, 1) },
    { metric: "C(N)", value: (params.CN+1)/2 },
    { metric: "B(t)", value: clamp(params.B/8, 0, 1) },
    { metric: "J(t)", value: clamp(params.J/10, 0, 1) },
  ];

  function handleAnalyze(){
    const est = parsePromptToParams(prompt);
    setParams(prev => ({ ...prev, ...est } as Params));
  }

  function applyPreset(name:string){ setParams(PRESETS[name]); }

  function downloadJSON(){
    const blob = new Blob([JSON.stringify({ prompt, params, psi, psiMag, psiPhase, psiProbDensity, timestamp: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "psi_analysis.json"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen w-full bg-neutral-50 text-neutral-900 p-6 sm:p-10">
        <div className="max-w-6xl mx-auto grid gap-6">
          <header className="flex items-center justify-between">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight flex items-center gap-3"><Sigma className="h-8 w-8"/> Destiny Ψ Analyzer</h1>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={downloadJSON}><Download className="h-4 w-4 mr-2"/>Esporta JSON</Button>
            </div>
          </header>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6 grid gap-4">
              <label className="text-sm font-medium">Scrivi un prompt (situazione, obiettivo, contesto)</label>
              <Textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Esempio: \n\nVoglio cambiare lavoro entro 3 mesi ma continuo a rimandare. Il mio team è diviso. Ho notato strane coincidenze positive nelle ultime due settimane..." className="min-h-[120px]"/>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleAnalyze}><Wand2 className="h-4 w-4 mr-2"/>Analizza</Button>
                <Button variant="outline" onClick={()=>applyPreset("Esempio 1 — Daniele & Sofia")}><BookOpen className="h-4 w-4 mr-2"/>Applica Esempio 1</Button>
                <Button variant="outline" onClick={()=>applyPreset("Esempio 2 — Carriera (placeholder)")}>Esempio 2</Button>
                <Button variant="outline" onClick={()=>applyPreset("Esempio 3 — Startup (placeholder)")}>Esempio 3</Button>
                <Button variant="outline" onClick={()=>applyPreset("Esempio 4 — Benessere (placeholder)")}>Esempio 4</Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="results" className="w-full">
            <TabsList className="grid grid-cols-3 sm:grid-cols-5 w-full">
              <TabsTrigger value="results">Risultati Ψ</TabsTrigger>
              <TabsTrigger value="params">Parametri</TabsTrigger>
              <TabsTrigger value="charts">Grafici</TabsTrigger>
              <TabsTrigger value="suggestions">Suggerimenti</TabsTrigger>
              <TabsTrigger value="about">Formula</TabsTrigger>
            </TabsList>

            <TabsContent value="results">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="rounded-2xl">
                  <CardContent className="p-6 grid gap-1">
                    <div className="text-sm text-neutral-500">|Ψ(t)| (ampiezza)</div>
                    <div className="text-3xl font-semibold">{fmt(psiMag, 4)}</div>
                    <div className="text-xs text-neutral-500">Densità |Ψ|² ≈ {fmt(psiProbDensity,4)}</div>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardContent className="p-6 grid gap-1">
                    <div className="text-sm text-neutral-500">Arg(Ψ) (fase)</div>
                    <div className="text-3xl font-semibold">{fmt(psiPhase, 4)} rad</div>
                    <div className="text-xs text-neutral-500">Ω = {fmt(params.Omega,4)} rad/giorno · t = {fmt(params.tDays,2)} giorni</div>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardContent className="p-6 grid gap-3">
                    <div className="text-sm text-neutral-500">Qualità attuale</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={params.P===0?"default":"destructive"}>{params.P===0?"Nessuna inversione (P=0)":"Inversione (P=1)"}</Badge>
                      <Badge variant={params.sgnD>0?"default":"outline"}>{params.sgnD>0?"Direzione +":"Direzione ±/−"}</Badge>
                      <Badge variant={params.K>1?"default":"outline"}>K={fmt(params.K,2)}</Badge>
                      <Badge variant={params.delta>0.4?"default":"outline"}>δ={fmt(params.delta,2)}</Badge>
                    </div>
                    <div className="text-xs text-neutral-500">Nota: modello speculativo a scopo riflessivo.</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="params">
              <Card className="rounded-2xl">
                <CardContent className="p-6 grid gap-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="grid gap-4">
                      <label className="text-sm font-medium flex items-center gap-2">Overthinking P <Tooltip><TooltipTrigger><Info className="h-4 w-4"/></TooltipTrigger><TooltipContent>0 = niente inversione, 1 = inversione energetica</TooltipContent></Tooltip></label>
                      <div className="flex items-center gap-3"><Button variant={params.P===0?"default":"outline"} onClick={()=>setParams(p=>({...p, P:0}))}>P=0</Button><Button variant={params.P===1?"default":"outline"} onClick={()=>setParams(p=>({...p, P:1}))}>P=1</Button></div>

                      <label className="text-sm font-medium">δ(i,j) — Connessione</label>
                      <Slider value={[params.delta]} onValueChange={([v])=>setParams(p=>({...p, delta: Number(v)}))} min={0} max={2} step={0.01}/>
                      <div className="text-xs">Attuale: {fmt(params.delta,2)} (0→2)</div>

                      <label className="text-sm font-medium">sgn(D) — Direzione decisioni</label>
                      <Slider value={[params.sgnD]} onValueChange={([v])=>setParams(p=>({...p, sgnD: Number(v)}))} min={-1} max={1} step={0.01}/>
                      <div className="text-xs">{fmt(params.sgnD,2)} (−1 distruttiva · +1 costruttiva)</div>

                      <label className="text-sm font-medium">|D| — Intensità decisioni</label>
                      <Slider value={[params.absD]} onValueChange={([v])=>setParams(p=>({...p, absD: Number(v)}))} min={0} max={10} step={0.1}/>
                      <div className="text-xs">{fmt(params.absD,1)} (0→10)</div>
                    </div>

                    <div className="grid gap-4">
                      <label className="text-sm font-medium">K(D) — Amplificazione</label>
                      <Slider value={[params.K]} onValueChange={([v])=>setParams(p=>({...p, K: Number(v)}))} min={0.1} max={12} step={0.01}/>
                      <div className="text-xs">{fmt(params.K,2)}</div>

                      <label className="text-sm font-medium">ξ(t) — Casualità favorevole</label>
                      <Slider value={[params.xi]} onValueChange={([v])=>setParams(p=>({...p, xi: Number(v)}))} min={0} max={5} step={0.01}/>
                      <div className="text-xs">{fmt(params.xi,2)}</div>

                      <label className="text-sm font-medium">C(N) — Influenza del network</label>
                      <Slider value={[params.CN]} onValueChange={([v])=>setParams(p=>({...p, CN: Number(v)}))} min={-1} max={1} step={0.01}/>
                      <div className="text-xs">{fmt(params.CN,2)} (−1→+1)</div>

                      <label className="text-sm font-medium">B(t) — Biforcazione</label>
                      <Slider value={[params.B]} onValueChange={([v])=>setParams(p=>({...p, B: Number(v)}))} min={0} max={8} step={0.01}/>
                      <div className="text-xs">{fmt(params.B,2)} (0→8+)</div>

                      <label className="text-sm font-medium">J(t) — Sincronicità junghiana</label>
                      <Slider value={[params.J]} onValueChange={([v])=>setParams(p=>({...p, J: Number(v)}))} min={0} max={10} step={0.01}/>
                      <div className="text-xs">{fmt(params.J,2)} (0→10)</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Ω — frequenza (rad/giorno)</label>
                      <Input type="number" value={params.Omega} onChange={e=>setParams(p=>({...p, Omega: Number(e.target.value)}))} />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">t — giorni nel ciclo</label>
                      <Slider value={[params.tDays]} onValueChange={([v])=>setParams(p=>({...p, tDays: Number(v)}))} min={0} max={180} step={1}/>
                      <div className="text-xs">{fmt(params.tDays,0)} giorni</div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-neutral-500">
                          <th className="py-2">Termine</th>
                          <th className="py-2">Valore</th>
                          <th className="py-2">Hint</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(r=> (
                          <tr key={r.key} className="border-t">
                            <td className="py-2 font-medium">{r.key}</td>
                            <td className="py-2">{fmt(r.value, 4)}</td>
                            <td className="py-2 text-neutral-500">{r.hint}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="charts">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="rounded-2xl h-[360px]">
                  <CardContent className="p-4 h-full">
                    <div className="text-sm text-neutral-500 mb-2 flex items-center gap-2"><LineChart className="h-4 w-4"/> Radar parametri normalizzati</div>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis angle={30} domain={[0, 1]} />
                        <Radar name="Valore" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.4} />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl h-[360px]">
                  <CardContent className="p-4 h-full">
                    <div className="text-sm text-neutral-500 mb-2 flex items-center gap-2"><Rocket className="h-4 w-4"/> Contributi (approssimati) ai termini</div>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: "Inversione·δ", value: Math.pow(-1, params.P) * params.delta },
                        { name: "sgn(D)·|D|·K", value: params.sgnD * params.absD * params.K },
                        { name: "ξ·C(N)·(1+B·J)", value: params.xi * params.CN * (1 + params.B * params.J) },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ReTooltip />
                        <Legend />
                        <Bar dataKey="value" name="Peso" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="suggestions">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="rounded-2xl">
                  <CardContent className="p-6">
                    <div className="text-sm font-medium mb-3 flex items-center gap-2"><FlaskConical className="h-4 w-4"/> PRO</div>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      {tips.pros.length ? tips.pros.map((t,i)=>(<li key={i}>{t}</li>)) : <li>Nessun vantaggio rilevante emerso.</li>}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardContent className="p-6">
                    <div className="text-sm font-medium mb-3 flex items-center gap-2"><Info className="h-4 w-4"/> CONTRO / RISCHI</div>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      {tips.cons.length ? tips.cons.map((t,i)=>(<li key={i}>{t}</li>)) : <li>Nessun rischio critico emerso.</li>}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl">
                  <CardContent className="p-6">
                    <div className="text-sm font-medium mb-3 flex items-center gap-2"><Rocket className="h-4 w-4"/> AZIONI CONSIGLIATE</div>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                      {tips.actions.length ? tips.actions.map((t,i)=>(<li key={i}>{t}</li>)) : (
                        <>
                          <li>Definisci una micro-azione (≤15 min) entro oggi.</li>
                          <li>Riduci input negativi e aumenta una fonte nutriente.</li>
                          <li>Programma il prossimo check-in tra 7 giorni.</li>
                        </>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="about">
              <Card className="rounded-2xl">
                <CardContent className="p-6 grid gap-4 text-sm leading-relaxed">
                  <div className="text-lg font-semibold">Formula generale</div>
                  <div className="font-mono text-xs overflow-x-auto p-3 bg-neutral-100 rounded-lg">Ψ(t) = Σ[(-1)^P · δ(i,j) + sgn(D) · |D| · K(D)] · e^(−iΩt) + ξ(t) · C(N) · [1 + B(t) · J(t)]</div>
                  <p>Questa app implementa una <span className="font-medium">metafora matematica</span> per aiutare il ragionamento decisionale: non è un modello scientifico, e i risultati non sono predizioni. I parametri si possono stimare dal prompt e poi perfezionare manualmente.</p>
                  <ul className="list-disc pl-5 grid gap-2">
                    <li><span className="font-medium">P</span>: overthinking (0/1) – l'inversione energetica.</li>
                    <li><span className="font-medium">δ(i,j)</span>: connessione/sincronia interpersonale.</li>
                    <li><span className="font-medium">sgn(D), |D|, K(D)</span>: direzione, intensità e amplificazione delle azioni.</li>
                    <li><span className="font-medium">e^{−iΩt}</span>: cicli personali (Ω) e fase (t).</li>
                    <li><span className="font-medium">ξ(t), C(N)</span>: casualità e influenza del network.</li>
                    <li><span className="font-medium">B(t), J(t)</span>: momenti critici e sincronicità.</li>
                  </ul>
                  <div className="text-xs text-neutral-500">Suggerimento: salva il JSON, ripeti l'analisi ogni settimana per vedere come cambia |Ψ|².</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <footer className="text-center text-xs text-neutral-500 py-6">© {new Date().getFullYear()} Destiny Ψ Analyzer — uso riflessivo/educativo.</footer>
        </div>
      </div>
    </TooltipProvider>
  );
}
