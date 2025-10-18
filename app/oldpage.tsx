"use client";
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

type Params = {
  P: 0 | 1;
  delta: number;
  sgnD: number;
  absD: number;
  K: number;
  xi: number;
  CN: number;
  B: number;
  J: number;
  Omega: number;
  tDays: number;
};

type BreakdownRow = { key: string; value: number; hint: string };

function clamp(num: number, min: number, max: number) { return Math.min(max, Math.max(min, num)); }
function complexExpMinusI(theta:number){ return { re: Math.cos(theta), im: -Math.sin(theta) }; }
function mag(z:{re:number, im:number}){ return Math.hypot(z.re, z.im); }
function phase(z:{re:number, im:number}){ return Math.atan2(z.im, z.re); }

function parsePromptToParams(prompt: string): Partial<Params> {
  const text = (prompt || "").toLowerCase();
  const pKeywords = ["non riesco", "ansia", "penso troppo", "overthinking", "blocco", "paralisi", "riscrivo", "continuo a pensare", "non decido", "paura", "procrastino", "cerco consigli", "ho riscritto"];
  const P: 0 | 1 = pKeywords.some(k => text.includes(k)) ? 1 : 0;
  const negCues = ["sabot", "evito", "rinvio", "lamento", "litigo", "rompo", "odio", "scappo", "rinuncio"];
  const posCues = ["costruire", "migliorare", "chiedo", "propongo", "avvio", "studio", "investo", "collaboro", "aiuto", "lancio", "presento", "applico", "partecipo"];
  let polarity = 0;
  if (negCues.some(k => text.includes(k))) polarity -= 1;
  if (posCues.some(k => text.includes(k))) polarity += 1;
  const sgnD = clamp(polarity, -1, 1);
  const intensityHints = (text.match(/(subito|oggi|adesso|ogni giorno|tutti i giorni|100|molto|forte|spesso|urgente|domani|settimana)/g) || []).length;
  const absD = clamp(2 + intensityHints * 0.6, 0, 10);
  const hasOther = /(lei|lui|socia|socio|cliente|partner|capo|team|fornitore|investitore|amico|amica)/.test(text);
  const delta = hasOther ? 0.5 : 0.2;
  const kept = (text.match(/promessa mantenuta|completat[oa]|finito|conclus[oa]/g) || []).length;
  const broken = (text.match(/promessa rott[ae]|rinvio|saltato|mancat[oa]/g) || []).length;
  const history = kept * 0.2 - broken * 0.3;
  const K = clamp(1 + 0.1 * sgnD * absD * absD + 0.01 * history, 0.1, 12);
  const xiHits = (text.match(/cas[ou]l|sincr|coincidenza|fortuna|tempismo|a caso|allineament[oi]|segn[o|ali]/g) || []).length;
  const xi = clamp(0.2 + xiHits * 0.3, 0, 5);
  const groupHits = (text.match(/team|gruppo|famiglia|amici|community|forum|reddit|telegram|facebook|social|clienti/g) || []).length;
  const CN = clamp( (groupHits ? 0.03 * groupHits : 0) * (text.includes("support") || text.includes("aiut") ? 1 : (text.includes("critica") || text.includes("scoragg") ? -1 : 1)), -1, 1);
  let B = 1.0;
  if (/bivio|critico|decisiv[ao]|urgenza|scelta|molte opzioni|non so|incertezza/.test(text)) B += 2.0;
  if (/entro|scadenza|24 ore|settimana|mese|domani|oggi/.test(text)) B += 1.0;
  B = clamp(B, 0, 8);
  const J = clamp( (text.match(/11:11|sogno|stesso momento|stessa canzone|segno|presagio|deja vu|déjà vu/g) || []).length * 0.7, 0, 10);
  const Omega = 2 * Math.PI / 28;
  const tDays = 0;
  return { P, sgnD, absD, delta, K, xi, CN, B, J, Omega, tDays };
}

function computePsi(params: Params){
  const { P, delta, sgnD, absD, K, Omega, tDays, xi, CN, B, J } = params;
  const inversion = Math.pow(-1, P);
  const decisionTerm = sgnD * absD * K;
  const sumBracket = inversion * delta + decisionTerm;
  const rot = complexExpMinusI(Omega * tDays);
  const base = { re: sumBracket * rot.re, im: sumBracket * rot.im };
  const noiseCollective = xi * CN * (1 + B * J);
  return { re: base.re + noiseCollective, im: base.im };
}

function fmt(n:number, d=3){ return Number.isFinite(n) ? n.toFixed(d) : "–"; }

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

const PRESETS: Record<string, Params> = {
  "Esempio 1 — Daniele & Sofia": {
    P: 1, delta: 0.44, sgnD: -0.57, absD: 1.07, K: 0.87, xi: 0.15, CN: -0.046, B: 3.94, J: 2.5, Omega: 2*Math.PI/28, tDays: 21,
  },
  "Esempio 2 — Carriera (placeholder)": {
    P: 0, delta: 0.35, sgnD: 0.4, absD: 5.2, K: 2.8, xi: 0.6, CN: 0.12, B: 2.2, J: 1.0, Omega: 2*Math.PI/33, tDays: 46,
  },
  "Esempio 3 — Startup (placeholder)": {
    P: 0, delta: 0.5, sgnD: 0.7, absD: 6.5, K: 3.6, xi: 0.9, CN: 0.2, B: 4.4, J: 1.8, Omega: 2*Math.PI/58, tDays: 120,
  },
  "Esempio 4 — Benessere (placeholder)": {
    P: 0, delta: 0.3, sgnD: 0.2, absD: 4.0, K: 1.6, xi: 0.5, CN: 0.05, B: 1.1, J: 0.6, Omega: 2*Math.PI/23, tDays: 12,
  },
};

const PRESET_TEXT: Record<string, string> = {
  "Esempio 1 — Daniele & Sofia": `SCENARIO: Daniele e la conquista di Sofia.

Contesto: Daniele (29, architetto) ha incontrato Sofia (27, grafica freelance) tre settimane fa a una mostra. Hanno parlato a lungo e si sono scambiati i numeri. Da allora Daniele è bloccato dall'ansia: riscrive ogni messaggio molte volte, chiede consigli a più amici, pensa continuamente a lei ma non propone un incontro reale. Alcune sincronicità ci sono state (stessi messaggi allo stesso momento, gusti musicali in comune), ma lui rimanda sempre l'azione. Vorrebbe capire come sbloccare la situazione, scegliere il momento giusto e agire con autenticità per invitarla a uscire concretamente.`,

  "Esempio 2 — Carriera (placeholder)": `Valuto se lasciare il mio impiego stabile per un ruolo più sfidante in un'altra azienda entro 60 giorni. Ho feedback positivi dal network, ma tendenza a rimandare le candidature e a perfezionare troppo il CV. Vorrei capire come massimizzare il timing e ridurre l'overthinking per inviare 5 candidature strategiche e preparare 2 colloqui simulati.`,

  "Esempio 3 — Startup (placeholder)": `Sto lanciando una startup SaaS: ho un MVP funzionante e due potenziali mentor. Tre clienti pilota sono interessati. Devo decidere se aprire adesso la beta privata o attendere altre feature. Ho segnali di sincronicità ricorrenti e una scadenza fiera tra 30 giorni. Voglio un piano d'azione chiaro per massimizzare l'effetto rete e la coerenza delle decisioni.`,

  "Esempio 4 — Benessere (placeholder)": `Voglio ristrutturare le mie abitudini di benessere: sonno, allenamento, alimentazione. Ho tentato più volte ma ricado nella routine. Ho un gruppo di amici pronti a supportarmi e un personal trainer disponibile. Vorrei definire micro-azioni settimanali, gestire i momenti di biforcazione (cene, viaggi) e sfruttare le sincronicità per restare in rotta per 8 settimane.`,
};

export default function Page(){
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
  const psiPhase = phase(psi);
  const psiProbDensity = psiMag*psiMag;
  const tips = useMemo(()=>generateAdvice(params), [params]);

  const radarData = [
    { metric: "Connessione δ", value: clamp(params.delta, 0, 1) },
    { metric: "Intensità |D|", value: params.absD / 10 },
    { metric: "Direzione sgn(D)", value: (params.sgnD+1)/2 },
    { metric: "K(D)", value: clamp(params.K/6, 0, 1) },
    { metric: "ξ(t)", value: clamp(params.xi/5, 0, 1) },
    { metric: "C(N)", value: (params.CN+1)/2 },
    { metric: "B(t)", value: clamp(params.B/8, 0, 1) },
    { metric: "J(t)", value: clamp(params.J/10, 0, 1) },
  ];

  function handleAnalyze(){
    const est = parsePromptToParams(prompt);
    setParams(prev => ({ ...prev, ...est } as Params));
  }

  function applyPreset(name:string){
    const p = PRESETS[name];
    if (!p) return;
    setParams(p);
    const txt = PRESET_TEXT[name];
    if (txt) setPrompt(txt);
  }

  function downloadJSON(){
    const blob = new Blob([JSON.stringify({ prompt, params, psi, psiMag, psiPhase, psiProbDensity, timestamp: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "psi_analysis.json"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen w-full bg-neutral-50 text-neutral-900 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto grid gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight flex items-center gap-3">Destiny Ψ Analyzer</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={downloadJSON}>Esporta JSON</Button>
          </div>
        </header>

        <Card className="rounded-2xl">
          <CardContent className="p-6 grid gap-4">
            <label className="text-sm font-medium">Scrivi un prompt (situazione, obiettivo, contesto)</label>
            <Textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder={"Esempio:\n\nVoglio cambiare lavoro entro 3 mesi ma continuo a rimandare. Il mio team è diviso. Ho notato strane coincidenze positive nelle ultime due settimane..."} className="min-h-[120px]"/>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleAnalyze}>Analizza</Button>
              <Button variant="outline" onClick={()=>applyPreset("Esempio 1 — Daniele & Sofia")}>Esempio 1</Button>
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
            <TabsTrigger value="legend">Legenda Ψ</TabsTrigger>
          </TabsList>

          <TabsContent value="results">
            <div className="grid md:grid-cols-4 gap-4">
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
                <CardContent className="p-6 grid gap-1">
                  <div className="text-sm text-neutral-500">Densità |Ψ|²</div>
                  <div className="text-3xl font-semibold">{fmt(psiProbDensity, 4)}</div>
                  <div className="text-xs text-neutral-500">
                    Probabilità relativa di manifestazione
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-6 grid gap-3">
                  <div className="text-sm text-neutral-500">Qualità attuale</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{params.P===0?"Nessuna inversione (P=0)":"Inversione (P=1)"}</Badge>
                    <Badge>{params.sgnD>0?"Direzione +":"Direzione ±/−"}</Badge>
                    <Badge>K={fmt(params.K,2)}</Badge>
                    <Badge>δ={fmt(params.delta,2)}</Badge>
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
                    <label className="text-sm font-medium flex items-center gap-2">Overthinking P</label>
                    <div className="flex items-center gap-3">
                      <Button onClick={()=>setParams(p=>({...p, P:0}))}>P=0</Button>
                      <Button variant="outline" onClick={()=>setParams(p=>({...p, P:1}))}>P=1</Button>
                    </div>

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
                  <div className="text-sm text-neutral-500 mb-2 flex items-center gap-2">Radar parametri normalizzati</div>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={30} domain={[0, 1]} />
                      <Radar name="Valore" dataKey="value" />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-2xl h-[360px]">
                <CardContent className="p-4 h-full">
                  <div className="text-sm text-neutral-500 mb-2 flex items-center gap-2">Contributi (approssimati) ai termini</div>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: "Inversione·δ", value: Math.pow(-1, params.P) * params.delta },
                      { name: "sgn(D)·|D|·K", value: params.sgnD * params.absD * params.K },
                      { name: "ξ·C(N)·(1+B·J)", value: params.xi * params.CN * (1 + params.B * params.J) },
                    ]}>
                      <CartesianGrid />
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
                  <div className="text-sm font-medium mb-3">PRO</div>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    {generateAdvice(params).pros.map((t,i)=>(<li key={i}>{t}</li>))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-6">
                  <div className="text-sm font-medium mb-3">CONTRO / RISCHI</div>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    {generateAdvice(params).cons.map((t,i)=>(<li key={i}>{t}</li>))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-6">
                  <div className="text-sm font-medium mb-3">AZIONI CONSIGLIATE</div>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    {generateAdvice(params).actions.map((t,i)=>(<li key={i}>{t}</li>))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="about">
            <Card className="rounded-2xl">
              <CardContent className="p-6 grid gap-4 text-sm leading-relaxed">
                <div className="text-lg font-semibold">Formula generale</div>
                <div className="font-mono text-xs overflow-x-auto p-3 bg-neutral-100 rounded-lg">
                  Ψ(t) = Σ[(-1)^P · δ(i,j) + sgn(D) · |D| · K(D)] · e^(−iΩt) + ξ(t) · C(N) · [1 + B(t) · J(t)]
                </div>
                <p>Questa app implementa una <span className="font-medium">metafora matematica</span> per aiutare il ragionamento decisionale: non è un modello scientifico, e i risultati non sono predizioni. I parametri si possono stimare dal prompt e poi perfezionare manualmente.</p>
                <ul className="list-disc pl-5 grid gap-2">
                  <li><span className="font-medium">P</span>: overthinking (0/1) – inversione energetica.</li>
                  <li><span className="font-medium">δ(i,j)</span>: connessione/sincronia interpersonale.</li>
                  <li><span className="font-medium">sgn(D), |D|, K(D)</span>: direzione, intensità e amplificazione delle azioni.</li>
                  <li><span className="font-medium">e^{"{"}-iΩt{"}"}</span>: cicli personali (Ω) e fase (t).</li>
                  <li><span className="font-medium">ξ(t), C(N)</span>: casualità e influenza del network.</li>
                  <li><span className="font-medium">B(t), J(t)</span>: momenti critici e sincronicità.</li>
                </ul>
                <div className="text-xs text-neutral-500">Suggerimento: salva il JSON, ripeti l'analisi ogni settimana per vedere come cambia |Ψ|².</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legend">
            <Card className="rounded-2xl">
              <CardContent className="p-6 grid gap-5 text-sm leading-relaxed">
                <div className="text-lg font-semibold">Legenda del Valore Ψ(t)</div>
          
                <div className="font-mono text-xs overflow-x-auto p-3 bg-neutral-100 rounded-lg">
                  Ψ(t) = Σ[(-1)^P · δ(i,j) + sgn(D) · |D| · K(D)] · e^(−iΩt) + ξ(t) · C(N) · [1 + B(t) · J(t)]
                </div>
          
                {/* 1) Ampiezza |Ψ| */}
                <div>
                  <div className="text-sm font-medium mb-2">1) Ampiezza |Ψ(t)| — Intensità complessiva del potenziale</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-neutral-500">
                          <th className="py-2">Intervallo</th>
                          <th className="py-2">Interpretazione</th>
                          <th className="py-2">Azione</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t"><td className="py-2">0.00–0.50</td><td className="py-2">Campo debole, dispersione</td><td className="py-2">Focalizza 1 obiettivo</td></tr>
                        <tr className="border-t"><td className="py-2">0.51–1.50</td><td className="py-2">Stabilità neutra</td><td className="py-2">Aumenta δ(i,j) con feedback</td></tr>
                        <tr className="border-t"><td className="py-2">1.51–3.00</td><td className="py-2">Coerenza parziale</td><td className="py-2">Mantieni ritmo e direzione</td></tr>
                        <tr className="border-t"><td className="py-2">3.01–5.00</td><td className="py-2">Coerenza elevata</td><td className="py-2">Agisci ora</td></tr>
                        <tr className="border-t"><td className="py-2">&gt; 5.00</td><td className="py-2">Risonanza eccessiva</td><td className="py-2">Rallenta, evita saturazione</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
          
                {/* 2) Fase Arg(Ψ) */}
                <div>
                  <div className="text-sm font-medium mb-2">2) Fase Arg(Ψ) — Stato ciclico e orientamento temporale</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-neutral-500">
                          <th className="py-2">Arg(Ψ) (rad)</th>
                          <th className="py-2">Fase</th>
                          <th className="py-2">Significato</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t"><td className="py-2">≈ 0</td><td className="py-2">Azione</td><td className="py-2">Allineamento, procedi</td></tr>
                        <tr className="border-t"><td className="py-2">π/4→π/2</td><td className="py-2">Transizione</td><td className="py-2">Stabilizza decisioni</td></tr>
                        <tr className="border-t"><td className="py-2">≈ π</td><td className="py-2">Inversione</td><td className="py-2">Overthinking, rischio auto-sabotaggio</td></tr>
                        <tr className="border-t"><td className="py-2">&gt; π</td><td className="py-2">Retrograda</td><td className="py-2">Ripetizione pattern: rivedi K(D), sgn(D)</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
          
                {/* 3) Densità |Ψ|² */}
                <div>
                  <div className="text-sm font-medium mb-2">3) Densità |Ψ|² — Potenziale manifestato</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-neutral-500">
                          <th className="py-2">|Ψ|²</th>
                          <th className="py-2">Significato</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t"><td className="py-2">&lt; 1</td><td className="py-2">Potenziale latente: serve azione</td></tr>
                        <tr className="border-t"><td className="py-2">1–4</td><td className="py-2">Coerenza in crescita</td></tr>
                        <tr className="border-t"><td className="py-2">4–9</td><td className="py-2">Campo coerente: alta probabilità</td></tr>
                        <tr className="border-t"><td className="py-2">&gt; 9</td><td className="py-2">Sovrasaturazione: rischio interferenze</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
          
                {/* 4) Mappa rapida */}
                <div>
                  <div className="text-sm font-medium mb-2">4) Mappa rapida</div>
                  <div className="grid sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-neutral-100"><div className="font-medium">Energia</div><div>|Ψ| — intensità del campo</div></div>
                    <div className="p-3 rounded-xl bg-neutral-100"><div className="font-medium">Allineamento</div><div>Arg(Ψ) — timing e fase</div></div>
                    <div className="p-3 rounded-xl bg-neutral-100"><div className="font-medium">Manifestazione</div><div>|Ψ|² — probabilità relativa</div></div>
                  </div>
                  <div className="text-xs text-neutral-500 mt-3">Nota: modello speculativo a scopo riflessivo/educativo.</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        <footer className="text-center text-xs text-neutral-500 py-6">© {new Date().getFullYear()} Destiny Ψ Analyzer — uso riflessivo/educativo.</footer>
      </div>
    </div>
  );
}
