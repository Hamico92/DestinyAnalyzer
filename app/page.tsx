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

// SISTEMA SUGGERIMENTI UNIVERSALE BASATO SOLO SUI PARAMETRI NUMERICI
function generateAdvice(params: Params) {
  const tips: { pros: string[]; cons: string[]; actions: string[] } = { 
    pros: [], 
    cons: [], 
    actions: [] 
  };
  
  const psi = computePsi(params);
  const psiMag = mag(psi);
  const psiProbDensity = psiMag * psiMag;
  const psiPhase = phase(psi);
  
  // ========== ANALISI DENSITÀ |Ψ|² (Probabilità Manifestazione) ==========
  if (psiProbDensity < 0.15) {
    tips.cons.push("📉 Densità |Ψ|² < 15%: probabilità manifestazione molto bassa");
    tips.actions.push("🔍 Rivaluta obiettivo: con <15% probabilità, vale davvero la pena investire energia?");
    tips.actions.push("🔄 Considera pivot completo: cambia target o approccio radicalmente");
  } else if (psiProbDensity >= 0.15 && psiProbDensity < 0.30) {
    tips.cons.push("⚠️ Densità |Ψ|² = " + fmt(psiProbDensity, 2) + " (15-30%): probabilità bassa");
    tips.actions.push("📊 Analizza costo-beneficio: energia investita vs probabilità successo");
    tips.actions.push("⚡ Per superare 30%: aumenta |D| (intensità) o δ (reciprocità)");
  } else if (psiProbDensity >= 0.30 && psiProbDensity < 0.50) {
    tips.pros.push("📈 Densità |Ψ|² = " + fmt(psiProbDensity, 2) + " (30-50%): probabilità moderata");
    tips.actions.push("🎯 Zona grigia: serve 1 azione decisiva per spostare sopra 50%");
  } else if (psiProbDensity >= 0.50 && psiProbDensity < 1.0) {
    tips.pros.push("✅ Densità |Ψ|² = " + fmt(psiProbDensity, 2) + " (50-100%): buona probabilità");
    tips.actions.push("🚀 Mantieni momentum: continua azioni coerenti");
  } else if (psiProbDensity >= 1.0 && psiProbDensity < 4.0) {
    tips.pros.push("🔥 Densità |Ψ|² = " + fmt(psiProbDensity, 2) + ": alta coerenza campo");
    tips.actions.push("⚡ Agisci ORA: momento favorevole, non rimandare");
  } else if (psiProbDensity >= 4.0) {
    tips.cons.push("⚡ Densità |Ψ|² > 4: possibile sovrasaturazione");
    tips.actions.push("🧘 Rallenta: troppa intensità può generare resistenza/burnout");
  }
  
  // ========== ANALISI OVERTHINKING (P) ==========
  if (params.P === 0) {
    tips.pros.push("✅ P=0: energia non invertita, nessun overthinking rilevato");
  } else {
    tips.cons.push("🧠 P=1: overthinking attivo, inversione energetica (-1)^P = -1");
    tips.actions.push("⏰ Finestra decisionale: 25 min pensiero MAX, poi azione obbligatoria");
    tips.actions.push("🚫 Stop ricerca consiglio: decide CHI agisce, non chi pensa");
  }
  
  // ========== ANALISI RECIPROCITÀ/CONNESSIONE (δ) ==========
  if (params.delta < 0.2) {
    tips.cons.push("⚠️ δ=" + fmt(params.delta, 2) + " < 0.2: connessione/reciprocità quasi nulla");
    tips.actions.push("🤝 Test reciprocità: proponi 1 interazione e osserva risposta entro 48h");
    tips.actions.push("❌ Se nessuna risposta → accetta realtà e redirect energia altrove");
  } else if (params.delta >= 0.2 && params.delta < 0.4) {
    tips.cons.push("📉 δ=" + fmt(params.delta, 2) + " (0.2-0.4): reciprocità bassa");
    tips.actions.push("📈 Aumenta δ: proponi 1 scambio paritario concreto (non unilaterale)");
  } else if (params.delta >= 0.4 && params.delta <= 0.7) {
    tips.pros.push("🔗 δ=" + fmt(params.delta, 2) + " (0.4-0.7): reciprocità equilibrata");
  } else if (params.delta > 0.7) {
    tips.pros.push("⚡ δ=" + fmt(params.delta, 2) + " > 0.7: alta sincronia/connessione");
    if (psiProbDensity < 0.5) {
      tips.cons.push("⚠️ PARADOSSO: δ alto ma |Ψ|² basso → altri fattori bloccano");
      tips.actions.push("🔍 Analizza: se δ è alto ma risultato basso, controlla sgn(D), K, B");
    }
  }
  
  // ========== ANALISI DIREZIONE (sgn(D)) ==========
  if (params.sgnD > 0.3) {
    tips.pros.push("➕ sgn(D)=" + fmt(params.sgnD, 2) + " positivo: direzione costruttiva");
  } else if (params.sgnD >= -0.3 && params.sgnD <= 0.3) {
    tips.cons.push("⚖️ sgn(D)=" + fmt(params.sgnD, 2) + " neutro: azioni senza direzione chiara");
    tips.actions.push("🎯 Definisci direzione: 1 azione esplicitamente costruttiva entro 24h");
  } else {
    tips.cons.push("➖ sgn(D)=" + fmt(params.sgnD, 2) + " negativo: pattern auto-sabotaggio");
    tips.actions.push("🛑 STOP 1 comportamento distruttivo: identifica e blocca");
    tips.actions.push("🔄 Sostituisci: per ogni azione negativa, 1 micro-azione +");
  }
  
  // ========== ANALISI INTENSITÀ (|D|) ==========
  if (params.absD < 2) {
    tips.cons.push("📊 |D|=" + fmt(params.absD, 1) + " < 2: intensità troppo bassa");
    tips.actions.push("⚡ Aumenta |D|: esegui 1 azione livello ≥4 entro 24h");
  } else if (params.absD >= 2 && params.absD <= 5) {
    tips.pros.push("📈 |D|=" + fmt(params.absD, 1) + " (2-5): intensità sufficiente");
  } else if (params.absD > 5 && params.absD <= 8) {
    tips.pros.push("🔥 |D|=" + fmt(params.absD, 1) + " alta: impegno significativo");
  } else {
    tips.cons.push("⚠️ |D|=" + fmt(params.absD, 1) + " > 8: possibile iperattività/burnout");
    tips.actions.push("🧘 Modera intensità: qualità > quantità nelle prossime 48h");
  }
  
  // ========== ANALISI AMPLIFICAZIONE KARMICA (K) ==========
  if (params.K < 0.8) {
    tips.cons.push("⚖️ K=" + fmt(params.K, 2) + " < 0.8: karma negativo, promesse rotte pesano");
    tips.actions.push("✅ Ripristina K: completa 1 impegno aperto o ripara 1 promessa");
  } else if (params.K >= 0.8 && params.K <= 1.5) {
    tips.pros.push("⚖️ K=" + fmt(params.K, 2) + " neutro: storia azioni equilibrata");
  } else {
    tips.pros.push("🔁 K=" + fmt(params.K, 2) + " > 1.5: amplificazione positiva, azioni passate aiutano");
  }
  
  // ========== ANALISI RETE (C(N)) ==========
  if (params.CN < -0.3) {
    tips.cons.push("👥 C(N)=" + fmt(params.CN, 2) + " < -0.3: influenza network negativa");
    tips.actions.push("🔄 Detox rete: -50% esposizione fonti tossiche per 7 giorni");
    tips.actions.push("➕ Aggiungi 1 mentor/contatto positivo entro 10 giorni");
  } else if (params.CN >= -0.3 && params.CN <= 0.3) {
    tips.pros.push("👥 C(N)=" + fmt(params.CN, 2) + " neutro: network non influisce significativamente");
  } else {
    tips.pros.push("👥 C(N)=" + fmt(params.CN, 2) + " > 0.3: supporto network positivo");
  }
  
  // ========== ANALISI BIFORCAZIONE (B) ==========
  if (params.B >= 3) {
    tips.pros.push("🔀 B=" + fmt(params.B, 1) + " ≥ 3: momento critico/biforcazione");
    tips.actions.push("⏱️ Decisione entro 48-72h: finestra opportunità o rischio imminente");
    tips.actions.push("🎯 Regola 'slow is smooth': pensa chiaro, poi agisci deciso");
  } else if (params.B >= 1.5 && params.B < 3) {
    tips.pros.push("⚖️ B=" + fmt(params.B, 1) + " (1.5-3): complessità moderata");
  }
  
  // ========== ANALISI SINCRONICITÀ (J) ==========
  if (params.J >= 2) {
    tips.pros.push("✨ J=" + fmt(params.J, 1) + " ≥ 2: pattern sincronicità rilevanti");
    tips.actions.push("🎯 Sfrutta momentum: agisci mentre 'vento è favorevole'");
  } else if (params.J < 0.5) {
    tips.cons.push("📉 J=" + fmt(params.J, 1) + " < 0.5: zero segnali sincronici");
  }
  
  // ========== ANALISI FASE Arg(Ψ) ==========
  const phaseNorm = ((psiPhase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  if (phaseNorm >= 0 && phaseNorm < Math.PI / 4) {
    tips.pros.push("🎯 Fase ≈ 0: allineamento ciclico, momento azione");
  } else if (phaseNorm >= Math.PI * 0.75 && phaseNorm <= Math.PI * 1.25) {
    tips.cons.push("🔄 Fase ≈ π: inversione ciclica, possibile auto-sabotaggio");
    tips.actions.push("⏳ Aspetta 3-7 giorni prima di decisioni critiche");
  } else if (phaseNorm > Math.PI * 1.25) {
    tips.cons.push("↩️ Fase > π: retrograda, ripetizione pattern passati");
    tips.actions.push("🔍 Rivedi K(D) e sgn(D): stai ripetendo errori?");
  }
  
  // ========== INTERAZIONI CRITICHE ==========
  
  // Delta alto + Probabilità bassa = ILLUSIONE
  if (params.delta >= 0.5 && psiProbDensity < 0.30) {
    tips.cons.push("💔 PARADOSSO: δ=" + fmt(params.delta, 2) + " alto ma |Ψ|²=" + fmt(psiProbDensity, 2) + " basso");
    tips.actions.push("🔍 Connessione c'è ma bloccata: analizza sgn(D), B(t), K(D)");
    tips.actions.push("❌ Se altri fattori immutabili → accetta che δ alto NON basta");
  }
  
  // Intensità alta + Direzione negativa = SPRECO ENERGIA
  if (params.absD >= 5 && params.sgnD < -0.3) {
    tips.cons.push("⚠️ SPRECO: alta intensità (|D|=" + fmt(params.absD, 1) + ") in direzione negativa");
    tips.actions.push("🛑 STOP immediato: stai danneggiando attivamente con impegno alto");
  }
  
  // Overthinking + Biforcazione = PARALISI CRITICA
  if (params.P === 1 && params.B >= 3) {
    tips.cons.push("🚨 PARALISI CRITICA: overthinking in momento decisivo");
    tips.actions.push("⏰ Timer 1 ora: decidi ADESSO, deadline non negoziabile");
  }
  
  // Probabilità bassissima (<20%) + Intensità alta
  if (psiProbDensity < 0.20 && params.absD >= 4) {
    tips.cons.push("💸 INEFFICIENZA: alta energia su probabilità <20%");
    tips.actions.push("🔄 Redirect urgente: stesso sforzo su target con >40% probabilità");
  }
  
  // Assicura almeno 1 azione
  if (tips.actions.length === 0) {
    tips.actions.push("📋 Prossima azione più piccola possibile: esegui OGGI entro 24h");
  }
  
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

Contesto: Daniele (29, architetto) ha incontrato Sofia (27, grafica freelance) tre settimane fa a una mostra. Hanno parlato a lungo e si sono scambiati i numeri. Da allora Daniele è bloccato dall'ansia: riscrive ogni messaggio molte volte, chiede consigli a più amici, pensa continuamente a lei ma non propone un incontro reale. Alcune sincronicità ci sono state (stessi messaggi allo stesso momento, gusti musicali in common), ma lui rimanda sempre l'azione. Vorrebbe capire come sbloccare la situazione, scegliere il momento giusto e agire con autenticità per invitarla a uscire concretamente.`,

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
                  <div className="text-sm font-medium mb-3">✅ PRO — Elementi favorevoli</div>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    {tips.pros.length > 0 ? tips.pros.map((t,i)=>(<li key={i}>{t}</li>)) : <li className="text-neutral-400">Nessun elemento favorevole rilevato con parametri attuali</li>}
                  </ul>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-6">
                  <div className="text-sm font-medium mb-3">⚠️ CONTRO — Rischi e ostacoli</div>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    {tips.cons.length > 0 ? tips.cons.map((t,i)=>(<li key={i}>{t}</li>)) : <li className="text-neutral-400">Nessun rischio critico rilevato con parametri attuali</li>}
                  </ul>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-6">
                  <div className="text-sm font-medium mb-3">🎯 AZIONI — Passi concreti</div>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    {tips.actions.map((t,i)=>(<li key={i}>{t}</li>))}
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
