"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Download, Globe } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip as ReTooltip } from "recharts";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { adviceTranslations } from "@/lib/i18n/advice-translations";

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
  
  // Keywords for Italian and English
  const pKeywordsIt = ["non riesco", "ansia", "penso troppo", "overthinking", "blocco", "paralisi", "riscrivo", "continuo a pensare", "non decido", "paura", "procrastino", "cerco consigli", "ho riscritto"];
  const pKeywordsEn = ["can't", "anxiety", "overthink", "stuck", "paralysis", "rewrite", "keep thinking", "can't decide", "fear", "procrastinate", "seeking advice", "rewrote"];
  const P: 0 | 1 = [...pKeywordsIt, ...pKeywordsEn].some(k => text.includes(k)) ? 1 : 0;
  
  const negCuesIt = ["sabot", "evito", "rinvio", "lamento", "litigo", "rompo", "odio", "scappo", "rinuncio"];
  const negCuesEn = ["sabotage", "avoid", "postpone", "complain", "fight", "break", "hate", "escape", "give up"];
  const posCuesIt = ["costruire", "migliorare", "chiedo", "propongo", "avvio", "studio", "investo", "collaboro", "aiuto", "lancio", "presento", "applico", "partecipo"];
  const posCuesEn = ["build", "improve", "ask", "propose", "start", "study", "invest", "collaborate", "help", "launch", "present", "apply", "participate"];
  
  let polarity = 0;
  if ([...negCuesIt, ...negCuesEn].some(k => text.includes(k))) polarity -= 1;
  if ([...posCuesIt, ...posCuesEn].some(k => text.includes(k))) polarity += 1;
  const sgnD = clamp(polarity, -1, 1);
  
  const intensityHintsIt = (text.match(/(subito|oggi|adesso|ogni giorno|tutti i giorni|100|molto|forte|spesso|urgente|domani|settimana)/g) || []).length;
  const intensityHintsEn = (text.match(/(immediately|today|now|every day|daily|100|very|strong|often|urgent|tomorrow|week)/g) || []).length;
  const absD = clamp(2 + (intensityHintsIt + intensityHintsEn) * 0.6, 0, 10);
  
  const hasOtherIt = /(lei|lui|socia|socio|cliente|partner|capo|team|fornitore|investitore|amico|amica)/.test(text);
  const hasOtherEn = /(she|he|partner|client|boss|team|supplier|investor|friend)/.test(text);
  const delta = (hasOtherIt || hasOtherEn) ? 0.5 : 0.2;
  
  const keptIt = (text.match(/promessa mantenuta|completat[oa]|finito|conclus[oa]/g) || []).length;
  const keptEn = (text.match(/promise kept|completed|finished|concluded/g) || []).length;
  const brokenIt = (text.match(/promessa rott[ae]|rinvio|saltato|mancat[oa]/g) || []).length;
  const brokenEn = (text.match(/promise broken|postponed|skipped|missed/g) || []).length;
  const history = (keptIt + keptEn) * 0.2 - (brokenIt + brokenEn) * 0.3;
  const K = clamp(1 + 0.1 * sgnD * absD * absD + 0.01 * history, 0.1, 12);
  
  const xiHitsIt = (text.match(/cas[ou]l|sincr|coincidenza|fortuna|tempismo|a caso|allineament[oi]|segn[o|ali]/g) || []).length;
  const xiHitsEn = (text.match(/random|sync|coincidence|luck|timing|by chance|alignment|sign/g) || []).length;
  const xi = clamp(0.2 + (xiHitsIt + xiHitsEn) * 0.3, 0, 5);
  
  const groupHitsIt = (text.match(/team|gruppo|famiglia|amici|community|forum|reddit|telegram|facebook|social|clienti/g) || []).length;
  const groupHitsEn = (text.match(/team|group|family|friends|community|forum|reddit|telegram|facebook|social|clients/g) || []).length;
  const CN = clamp( ((groupHitsIt + groupHitsEn) ? 0.03 * (groupHitsIt + groupHitsEn) : 0) * ((text.includes("support") || text.includes("aiut")) ? 1 : ((text.includes("critica") || text.includes("critic") || text.includes("scoragg")) ? -1 : 1)), -1, 1);
  
  let B = 1.0;
  if (/bivio|critico|decisiv[ao]|urgenza|scelta|molte opzioni|non so|incertezza|critical|decisive|urgency|choice|many options|don't know|uncertainty/.test(text)) B += 2.0;
  if (/entro|scadenza|24 ore|settimana|mese|domani|oggi|within|deadline|24 hours|week|month|tomorrow|today/.test(text)) B += 1.0;
  B = clamp(B, 0, 8);
  
  const JIt = (text.match(/11:11|sogno|stesso momento|stessa canzone|segno|presagio|deja vu|déjà vu/g) || []).length;
  const JEn = (text.match(/11:11|dream|same moment|same song|sign|omen|deja vu|déjà vu/g) || []).length;
  const J = clamp((JIt + JEn) * 0.7, 0, 10);
  
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

function generateAdvice(params: Params, language: 'it' | 'en') {
  const tips: { pros: string[]; cons: string[]; actions: string[] } = { 
    pros: [], 
    cons: [], 
    actions: [] 
  };
  
  const t = adviceTranslations[language];
  const psi = computePsi(params);
  const psiMag = mag(psi);
  const psiProbDensity = psiMag * psiMag;
  const psiPhase = phase(psi);
  
  // Density analysis
  if (psiProbDensity < 0.15) {
    tips.cons.push(t.densityVeryLow);
    tips.actions.push(t.reevaluateGoal);
    tips.actions.push(t.considerPivot);
  } else if (psiProbDensity >= 0.15 && psiProbDensity < 0.30) {
    tips.cons.push(t.densityLow.replace('{value}', fmt(psiProbDensity, 2)));
    tips.actions.push(t.analyzeCostBenefit);
    tips.actions.push(t.increaseIntensity);
  } else if (psiProbDensity >= 0.30 && psiProbDensity < 0.50) {
    tips.pros.push(t.densityModerate.replace('{value}', fmt(psiProbDensity, 2)));
    tips.actions.push(t.grayZone);
  } else if (psiProbDensity >= 0.50 && psiProbDensity < 1.0) {
    tips.pros.push(t.densityGood.replace('{value}', fmt(psiProbDensity, 2)));
    tips.actions.push(t.maintainMomentum);
  } else if (psiProbDensity >= 1.0 && psiProbDensity < 4.0) {
    tips.pros.push(t.densityHigh.replace('{value}', fmt(psiProbDensity, 2)));
    tips.actions.push(t.actNowFavorable);
  } else if (psiProbDensity >= 4.0) {
    tips.cons.push(t.densityOversaturated);
    tips.actions.push(t.slowDownBurnout);
  }
  
  // Overthinking analysis
  if (params.P === 0) {
    tips.pros.push(t.noOverthinking);
  } else {
    tips.cons.push(t.overthinkingActive);
    tips.actions.push(t.decisionWindow);
    tips.actions.push(t.stopAdviceSeeking);
  }
  
  // Reciprocity analysis
  if (params.delta < 0.2) {
    tips.cons.push(t.reciprocityAlmostNull.replace('{value}', fmt(params.delta, 2)));
    tips.actions.push(t.testReciprocity);
    tips.actions.push(t.acceptReality);
  } else if (params.delta >= 0.2 && params.delta < 0.4) {
    tips.cons.push(t.reciprocityLow.replace('{value}', fmt(params.delta, 2)));
    tips.actions.push(t.increaseDeltaAction);
  } else if (params.delta >= 0.4 && params.delta <= 0.7) {
    tips.pros.push(t.reciprocityBalanced.replace('{value}', fmt(params.delta, 2)));
  } else if (params.delta > 0.7) {
    tips.pros.push(t.reciprocityHigh.replace('{value}', fmt(params.delta, 2)));
    if (psiProbDensity < 0.5) {
      tips.cons.push(t.paradoxHighDelta);
      tips.actions.push(t.analyzeBlocking);
    }
  }
  
  // Direction analysis
  if (params.sgnD > 0.3) {
    tips.pros.push(t.directionPositive.replace('{value}', fmt(params.sgnD, 2)));
  } else if (params.sgnD >= -0.3 && params.sgnD <= 0.3) {
    tips.cons.push(t.directionNeutral.replace('{value}', fmt(params.sgnD, 2)));
    tips.actions.push(t.defineDirection);
  } else {
    tips.cons.push(t.directionNegative.replace('{value}', fmt(params.sgnD, 2)));
    tips.actions.push(t.stopDestructive);
    tips.actions.push(t.substituteNegative);
  }
  
  // Intensity analysis
  if (params.absD < 2) {
    tips.cons.push(t.intensityTooLow.replace('{value}', fmt(params.absD, 1)));
    tips.actions.push(t.increaseIntensityAction);
  } else if (params.absD >= 2 && params.absD <= 5) {
    tips.pros.push(t.intensitySufficient.replace('{value}', fmt(params.absD, 1)));
  } else if (params.absD > 5 && params.absD <= 8) {
    tips.pros.push(t.intensityHigh.replace('{value}', fmt(params.absD, 1)));
  } else {
    tips.cons.push(t.intensityExcessive.replace('{value}', fmt(params.absD, 1)));
    tips.actions.push(t.moderateIntensity);
  }
  
  // Karma analysis
  if (params.K < 0.8) {
    tips.cons.push(t.karmaNegative.replace('{value}', fmt(params.K, 2)));
    tips.actions.push(t.restoreKarma);
  } else if (params.K >= 0.8 && params.K <= 1.5) {
    tips.pros.push(t.karmaNeutral.replace('{value}', fmt(params.K, 2)));
  } else {
    tips.pros.push(t.karmaPositive.replace('{value}', fmt(params.K, 2)));
  }
  
  // Network analysis
  if (params.CN < -0.3) {
    tips.cons.push(t.networkNegative.replace('{value}', fmt(params.CN, 2)));
    tips.actions.push(t.networkDetox);
    tips.actions.push(t.addMentor);
  } else if (params.CN >= -0.3 && params.CN <= 0.3) {
    tips.pros.push(t.networkNeutral.replace('{value}', fmt(params.CN, 2)));
  } else {
    tips.pros.push(t.networkPositive.replace('{value}', fmt(params.CN, 2)));
  }
  
  // Bifurcation analysis
  if (params.B >= 3) {
    tips.pros.push(t.bifurcationCritical.replace('{value}', fmt(params.B, 1)));
    tips.actions.push(t.decisionTimeframe);
    tips.actions.push(t.slowIsSmooth);
  } else if (params.B >= 1.5 && params.B < 3) {
    tips.pros.push(t.bifurcationModerate.replace('{value}', fmt(params.B, 1)));
  }
  
  // Synchronicity analysis
  if (params.J >= 2) {
    tips.pros.push(t.synchronicityRelevant.replace('{value}', fmt(params.J, 1)));
    tips.actions.push(t.leverageMomentum);
  } else if (params.J < 0.5) {
    tips.cons.push(t.synchronicityLow.replace('{value}', fmt(params.J, 1)));
  }
  
  // Phase analysis
  const phaseNorm = ((psiPhase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  if (phaseNorm >= 0 && phaseNorm < Math.PI / 4) {
    tips.pros.push(t.phaseAligned);
  } else if (phaseNorm >= Math.PI * 0.75 && phaseNorm <= Math.PI * 1.25) {
    tips.cons.push(t.phaseInversion);
    tips.actions.push(t.waitBeforeDecisions);
  } else if (phaseNorm > Math.PI * 1.25) {
    tips.cons.push(t.phaseRetrograde);
    tips.actions.push(t.reviewPatterns);
  }
  
  // Critical interactions
  if (params.delta >= 0.5 && psiProbDensity < 0.30) {
    tips.cons.push(t.illusionParadox.replace('{delta}', fmt(params.delta, 2)).replace('{density}', fmt(psiProbDensity, 2)));
    tips.actions.push(t.connectionBlocked);
    tips.actions.push(t.acceptHighDelta);
  }
  
  if (params.absD >= 5 && params.sgnD < -0.3) {
    tips.cons.push(t.energyWaste.replace('{intensity}', fmt(params.absD, 1)));
    tips.actions.push(t.stopImmediately);
  }
  
  if (params.P === 1 && params.B >= 3) {
    tips.cons.push(t.criticalParalysis);
    tips.actions.push(t.oneHourTimer);
  }
  
  if (psiProbDensity < 0.20 && params.absD >= 4) {
    tips.cons.push(t.inefficiency);
    tips.actions.push(t.redirectUrgent);
  }
  
  if (tips.actions.length === 0) {
    tips.actions.push(t.nextSmallAction);
  }
  
  return tips;
}

const PRESETS = {
  it: {
    "Esempio 1": {
      params: {
        P: 1, delta: 0.44, sgnD: -0.57, absD: 1.07, K: 0.87, xi: 0.15, CN: -0.046, B: 3.94, J: 2.5, Omega: 2*Math.PI/28, tDays: 21,
      } as Params,
      text: `SCENARIO: Daniele e la conquista di Sofia.

Contesto: Daniele (29, architetto) ha incontrato Sofia (27, grafica freelance) tre settimane fa a una mostra. Hanno parlato a lungo e si sono scambiati i numeri. Da allora Daniele è bloccato dall'ansia: riscrive ogni messaggio molte volte, chiede consigli a più amici, pensa continuamente a lei ma non propone un incontro reale. Alcune sincronicità ci sono state (stessi messaggi allo stesso momento, gusti musicali in comune), ma lui rimanda sempre l'azione. Vorrebbe capire come sbloccare la situazione, scegliere il momento giusto e agire con autenticità per invitarla a uscire concretamente.`,
    },
    "Esempio 2": {
      params: {
        P: 0, delta: 0.35, sgnD: 0.4, absD: 5.2, K: 2.8, xi: 0.6, CN: 0.12, B: 2.2, J: 1.0, Omega: 2*Math.PI/33, tDays: 46,
      } as Params,
      text: `Valuto se lasciare il mio impiego stabile per un ruolo più sfidante in un'altra azienda entro 60 giorni. Ho feedback positivi dal network, ma tendenza a rimandare le candidature e a perfezionare troppo il CV. Vorrei capire come massimizzare il timing e ridurre l'overthinking per inviare 5 candidature strategiche e preparare 2 colloqui simulati.`,
    },
    "Esempio 3": {
      params: {
        P: 0, delta: 0.5, sgnD: 0.7, absD: 6.5, K: 3.6, xi: 0.9, CN: 0.2, B: 4.4, J: 1.8, Omega: 2*Math.PI/58, tDays: 120,
      } as Params,
      text: `Sto lanciando una startup SaaS: ho un MVP funzionante e due potenziali mentor. Tre clienti pilota sono interessati. Devo decidere se aprire adesso la beta privata o attendere altre feature. Ho segnali di sincronicità ricorrenti e una scadenza fiera tra 30 giorni. Voglio un piano d'azione chiaro per massimizzare l'effetto rete e la coerenza delle decisioni.`,
    },
    "Esempio 4": {
      params: {
        P: 0, delta: 0.3, sgnD: 0.2, absD: 4.0, K: 1.6, xi: 0.5, CN: 0.05, B: 1.1, J: 0.6, Omega: 2*Math.PI/23, tDays: 12,
      } as Params,
      text: `Voglio ristrutturare le mie abitudini di benessere: sonno, allenamento, alimentazione. Ho tentato più volte ma ricado nella routine. Ho un gruppo di amici pronti a supportarmi e un personal trainer disponibile. Vorrei definire micro-azioni settimanali, gestire i momenti di biforcazione (cene, viaggi) e sfruttare le sincronicità per restare in rotta per 8 settimane.`,
    },
  },
  en: {
    "Example 1": {
      params: {
        P: 1, delta: 0.44, sgnD: -0.57, absD: 1.07, K: 0.87, xi: 0.15, CN: -0.046, B: 3.94, J: 2.5, Omega: 2*Math.PI/28, tDays: 21,
      } as Params,
      text: `SCENARIO: Daniel and winning over Sofia.

Context: Daniel (29, architect) met Sofia (27, freelance graphic designer) three weeks ago at an exhibition. They talked at length and exchanged numbers. Since then Daniel has been blocked by anxiety: he rewrites every message multiple times, asks multiple friends for advice, thinks about her constantly but doesn't propose a real meeting. Some synchronicities have occurred (same messages at the same time, shared musical tastes), but he always postpones action. He wants to understand how to unblock the situation, choose the right moment and act authentically to actually ask her out.`,
    },
    "Example 2": {
      params: {
        P: 0, delta: 0.35, sgnD: 0.4, absD: 5.2, K: 2.8, xi: 0.6, CN: 0.12, B: 2.2, J: 1.0, Omega: 2*Math.PI/33, tDays: 46,
      } as Params,
      text: `I'm evaluating whether to leave my stable job for a more challenging role at another company within 60 days. I have positive feedback from my network, but tend to postpone applications and over-perfect my CV. I want to understand how to maximize timing and reduce overthinking to send 5 strategic applications and prepare 2 mock interviews.`,
    },
    "Example 3": {
      params: {
        P: 0, delta: 0.5, sgnD: 0.7, absD: 6.5, K: 3.6, xi: 0.9, CN: 0.2, B: 4.4, J: 1.8, Omega: 2*Math.PI/58, tDays: 120,
      } as Params,
      text: `I'm launching a SaaS startup: I have a working MVP and two potential mentors. Three pilot customers are interested. I need to decide whether to open the private beta now or wait for more features. I have recurring synchronicity signals and a trade show deadline in 30 days. I want a clear action plan to maximize network effect and decision coherence.`,
    },
    "Example 4": {
      params: {
        P: 0, delta: 0.3, sgnD: 0.2, absD: 4.0, K: 1.6, xi: 0.5, CN: 0.05, B: 1.1, J: 0.6, Omega: 2*Math.PI/23, tDays: 12,
      } as Params,
      text: `I want to restructure my wellness habits: sleep, training, nutrition. I've tried multiple times but fall back into routine. I have a group of friends ready to support me and a personal trainer available. I want to define weekly micro-actions, manage bifurcation moments (dinners, trips) and leverage synchronicities to stay on track for 8 weeks.`,
    },
  },
};

export default function Page(){
  const { language, setLanguage, t } = useLanguage();
  const [prompt, setPrompt] = useState("");
  const [params, setParams] = useState<Params>({ P:0, delta:0.2, sgnD:0, absD:2, K:1, xi:0.2, CN:0, B:1, J:0, Omega:2*Math.PI/28, tDays:0 });
  const [rows, setRows] = useState<BreakdownRow[]>([]);

  useEffect(()=>{
    const r: BreakdownRow[] = [
      { key: "(-1)^P", value: Math.pow(-1, params.P), hint: t('hintOverthinking') },
      { key: "δ(i,j)", value: params.delta, hint: t('hintConnection') },
      { key: "sgn(D)", value: params.sgnD, hint: t('hintDirection') },
      { key: "|D|", value: params.absD, hint: t('hintIntensity') },
      { key: "K(D)", value: params.K, hint: t('hintAmplification') },
      { key: "e^{-iΩt} (Re)", value: Math.cos(params.Omega*params.tDays), hint: t('hintRealPart') },
      { key: "e^{-iΩt} (Im)", value: -Math.sin(params.Omega*params.tDays), hint: t('hintImaginaryPart') },
      { key: "ξ(t)", value: params.xi, hint: t('hintSerendipity') },
      { key: "C(N)", value: params.CN, hint: t('hintNetwork') },
      { key: "B(t)", value: params.B, hint: t('hintBifurcation') },
      { key: "J(t)", value: params.J, hint: t('hintSynchronicity') },
    ];
    setRows(r);
  }, [params, t]);

  const psi = useMemo(()=>computePsi(params), [params]);
  const psiMag = mag(psi);
  const psiPhase = phase(psi);
  const psiProbDensity = psiMag*psiMag;
  const tips = useMemo(()=>generateAdvice(params, language), [params, language]);

  const radarData = [
    { metric: t('connection'), value: clamp(params.delta, 0, 1) },
    { metric: t('intensity'), value: params.absD / 10 },
    { metric: t('direction'), value: (params.sgnD+1)/2 },
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
    const preset = PRESETS[language][name as keyof typeof PRESETS['it']];
    if (!preset) return;
    setParams(preset.params);
    setPrompt(preset.text);
  }

  function downloadJSON(){
    const blob = new Blob([JSON.stringify({ prompt, params, psi, psiMag, psiPhase, psiProbDensity, timestamp: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "psi_analysis.json"; a.click();
    URL.revokeObjectURL(url);
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen w-full bg-neutral-50 text-neutral-900 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto grid gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight flex items-center gap-3">{t('title')}</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setLanguage(language === 'it' ? 'en' : 'it')}
              className="flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              {language === 'it' ? 'EN' : 'IT'}
            </Button>
            <Button variant="secondary" onClick={downloadJSON} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              {t('exportJson')}
            </Button>
          </div>
        </header>

        <Card className="rounded-2xl">
          <CardContent className="p-6 grid gap-4">
            <label className="text-sm font-medium">{t('promptLabel')}</label>
            <Textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder={t('promptPlaceholder')} className="min-h-[120px]"/>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleAnalyze}>{t('analyzeButton')}</Button>
              <Button variant="outline" onClick={()=>applyPreset(language === 'it' ? "Esempio 1" : "Example 1")}>{t('example1')}</Button>
              <Button variant="outline" onClick={()=>applyPreset(language === 'it' ? "Esempio 2" : "Example 2")}>{t('example2')}</Button>
              <Button variant="outline" onClick={()=>applyPreset(language === 'it' ? "Esempio 3" : "Example 3")}>{t('example3')}</Button>
              <Button variant="outline" onClick={()=>applyPreset(language === 'it' ? "Esempio 4" : "Example 4")}>{t('example4')}</Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full">
            <TabsTrigger value="results">{t('tabResults')}</TabsTrigger>
            <TabsTrigger value="params">{t('tabParams')}</TabsTrigger>
            <TabsTrigger value="charts">{t('tabCharts')}</TabsTrigger>
            <TabsTrigger value="suggestions">{t('tabSuggestions')}</TabsTrigger>
            <TabsTrigger value="about">{t('tabFormula')}</TabsTrigger>
            <TabsTrigger value="legend">{t('tabLegend')}</TabsTrigger>
          </TabsList>

          <TabsContent value="results">
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-6 grid gap-1">
                  <div className="text-sm text-neutral-500">{t('amplitude')}</div>
                  <div className="text-3xl font-semibold">{fmt(psiMag, 4)}</div>
                  <div className="text-xs text-neutral-500">{t('density')} ≈ {fmt(psiProbDensity,4)}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-6 grid gap-1">
                  <div className="text-sm text-neutral-500">{t('phase')}</div>
                  <div className="text-3xl font-semibold">{fmt(psiPhase, 4)} rad</div>
                  <div className="text-xs text-neutral-500">Ω = {fmt(params.Omega,4)} rad/{language === 'it' ? 'giorno' : 'day'} · t = {fmt(params.tDays,2)} {t('days')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-6 grid gap-1">
                  <div className="text-sm text-neutral-500">{t('density')}</div>
                  <div className="text-3xl font-semibold">{fmt(psiProbDensity, 4)}</div>
                  <div className="text-xs text-neutral-500">{t('densitySubtext')}</div>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-6 grid gap-3">
                  <div className="text-sm text-neutral-500">{t('currentQuality')}</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{params.P===0 ? t('noInversion') : t('inversion')}</Badge>
                    <Badge>{params.sgnD>0 ? t('positiveDirection') : t('neutralDirection')}</Badge>
                    <Badge>K={fmt(params.K,2)}</Badge>
                    <Badge>δ={fmt(params.delta,2)}</Badge>
                  </div>
                  <div className="text-xs text-neutral-500">{t('speculativeNote')}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="params">
            <Card className="rounded-2xl">
              <CardContent className="p-6 grid gap-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="grid gap-4">
                    <label className="text-sm font-medium flex items-center gap-2">{t('overthinking')}</label>
                    <div className="flex items-center gap-3">
                      <Button onClick={()=>setParams(p=>({...p, P:0}))}>P=0</Button>
                      <Button variant="outline" onClick={()=>setParams(p=>({...p, P:1}))}>P=1</Button>
                    </div>

                    <label className="text-sm font-medium">{t('connection')}</label>
                    <Slider value={[params.delta]} onValueChange={([v])=>setParams(p=>({...p, delta: Number(v)}))} min={0} max={2} step={0.01}/>
                    <div className="text-xs">{t('current')}: {fmt(params.delta,2)} (0→2)</div>

                    <label className="text-sm font-medium">{t('direction')}</label>
                    <Slider value={[params.sgnD]} onValueChange={([v])=>setParams(p=>({...p, sgnD: Number(v)}))} min={-1} max={1} step={0.01}/>
                    <div className="text-xs">{fmt(params.sgnD,2)} (−1 {t('destructive')} · +1 {t('constructive')})</div>

                    <label className="text-sm font-medium">{t('intensity')}</label>
                    <Slider value={[params.absD]} onValueChange={([v])=>setParams(p=>({...p, absD: Number(v)}))} min={0} max={10} step={0.1}/>
                    <div className="text-xs">{fmt(params.absD,1)} (0→10)</div>
                  </div>

                  <div className="grid gap-4">
                    <label className="text-sm font-medium">{t('amplification')}</label>
                    <Slider value={[params.K]} onValueChange={([v])=>setParams(p=>({...p, K: Number(v)}))} min={0.1} max={12} step={0.01}/>
                    <div className="text-xs">{fmt(params.K,2)}</div>

                    <label className="text-sm font-medium">{t('serendipity')}</label>
                    <Slider value={[params.xi]} onValueChange={([v])=>setParams(p=>({...p, xi: Number(v)}))} min={0} max={5} step={0.01}/>
                    <div className="text-xs">{fmt(params.xi,2)}</div>

                    <label className="text-sm font-medium">{t('networkInfluence')}</label>
                    <Slider value={[params.CN]} onValueChange={([v])=>setParams(p=>({...p, CN: Number(v)}))} min={-1} max={1} step={0.01}/>
                    <div className="text-xs">{fmt(params.CN,2)} (−1→+1)</div>

                    <label className="text-sm font-medium">{t('bifurcation')}</label>
                    <Slider value={[params.B]} onValueChange={([v])=>setParams(p=>({...p, B: Number(v)}))} min={0} max={8} step={0.01}/>
                    <div className="text-xs">{fmt(params.B,2)} (0→8+)</div>

                    <label className="text-sm font-medium">{t('synchronicity')}</label>
                    <Slider value={[params.J]} onValueChange={([v])=>setParams(p=>({...p, J: Number(v)}))} min={0} max={10} step={0.01}/>
                    <div className="text-xs">{fmt(params.J,2)} (0→10)</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">{t('frequency')}</label>
                    <Input type="number" value={params.Omega} onChange={e=>setParams(p=>({...p, Omega: Number(e.target.value)}))} />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">{t('daysInCycle')}</label>
                    <Slider value={[params.tDays]} onValueChange={([v])=>setParams(p=>({...p, tDays: Number(v)}))} min={0} max={180} step={1}/>
                    <div className="text-xs">{fmt(params.tDays,0)} {t('days')}</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-neutral-500">
                        <th className="py-2">{t('term')}</th>
                        <th className="py-2">{t('value')}</th>
                        <th className="py-2">{t('hint')}</th>
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
                  <div className="text-sm text-neutral-500 mb-2 flex items-center gap-2">{t('radarTitle')}</div>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={30} domain={[0, 1]} />
                      <Radar name={t('value')} dataKey="value" />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-2xl h-[360px]">
                <CardContent className="p-4 h-full">
                  <div className="text-sm text-neutral-500 mb-2 flex items-center gap-2">{t('contributionsTitle')}</div>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: "(-1)^P·δ", value: Math.pow(-1, params.P) * params.delta },
                      { name: "sgn(D)·|D|·K", value: params.sgnD * params.absD * params.K },
                      { name: "ξ·C(N)·(1+B·J)", value: params.xi * params.CN * (1 + params.B * params.J) },
                    ]}>
                      <CartesianGrid />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ReTooltip />
                      <Legend />
                      <Bar dataKey="value" name={t('weight')} />
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
                  <div className="text-sm font-medium mb-3">{t('prosTitle')}</div>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    {tips.pros.length > 0 ? tips.pros.map((tip,i)=>(<li key={i}>{tip}</li>)) : <li className="text-neutral-400">{t('noPros')}</li>}
                  </ul>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-6">
                  <div className="text-sm font-medium mb-3">{t('consTitle')}</div>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    {tips.cons.length > 0 ? tips.cons.map((tip,i)=>(<li key={i}>{tip}</li>)) : <li className="text-neutral-400">{t('noCons')}</li>}
                  </ul>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-6">
                  <div className="text-sm font-medium mb-3">{t('actionsTitle')}</div>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    {tips.actions.map((tip,i)=>(<li key={i}>{tip}</li>))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="about">
            <Card className="rounded-2xl">
              <CardContent className="p-6 grid gap-4 text-sm leading-relaxed">
                <div className="text-lg font-semibold">{t('formulaTitle')}</div>
                <div className="font-mono text-xs overflow-x-auto p-3 bg-neutral-100 rounded-lg">
                  Ψ(t) = Σ[(-1)^P · δ(i,j) + sgn(D) · |D| · K(D)] · e^(−iΩt) + ξ(t) · C(N) · [1 + B(t) · J(t)]
                </div>
                <p dangerouslySetInnerHTML={{ __html: t('formulaDescription') }}></p>
                <ul className="list-disc pl-5 grid gap-2">
                  <li>{t('formulaP')}</li>
                  <li>{t('formulaDelta')}</li>
                  <li>{t('formulaSgn')}</li>
                  <li>{t('formulaExp')}</li>
                  <li>{t('formulaXi')}</li>
                  <li>{t('formulaB')}</li>
                </ul>
                <div className="text-xs text-neutral-500">{t('formulaTip')}</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legend">
            <Card className="rounded-2xl">
              <CardContent className="p-6 grid gap-5 text-sm leading-relaxed">
                <div className="text-lg font-semibold">{t('legendTitle')}</div>
          
                <div className="font-mono text-xs overflow-x-auto p-3 bg-neutral-100 rounded-lg">
                  Ψ(t) = Σ[(-1)^P · δ(i,j) + sgn(D) · |D| · K(D)] · e^(−iΩt) + ξ(t) · C(N) · [1 + B(t) · J(t)]
                </div>
          
                <div>
                  <div className="text-sm font-medium mb-2">{t('legendAmplitude')}</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-neutral-500">
                          <th className="py-2">{t('interval')}</th>
                          <th className="py-2">{t('interpretation')}</th>
                          <th className="py-2">{t('action')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t"><td className="py-2">0.00–0.50</td><td className="py-2">{t('weakField')}</td><td className="py-2">{t('focusGoal')}</td></tr>
                        <tr className="border-t"><td className="py-2">0.51–1.50</td><td className="py-2">{t('neutralStability')}</td><td className="py-2">{t('increaseDelta')}</td></tr>
                        <tr className="border-t"><td className="py-2">1.51–3.00</td><td className="py-2">{t('partialCoherence')}</td><td className="py-2">{t('maintainRhythm')}</td></tr>
                        <tr className="border-t"><td className="py-2">3.01–5.00</td><td className="py-2">{t('highCoherence')}</td><td className="py-2">{t('actNow')}</td></tr>
                        <tr className="border-t"><td className="py-2">&gt; 5.00</td><td className="py-2">{t('excessiveResonance')}</td><td className="py-2">{t('slowDown')}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
          
                <div>
                  <div className="text-sm font-medium mb-2">{t('legendPhase')}</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-neutral-500">
                          <th className="py-2">{t('phaseRad')}</th>
                          <th className="py-2">{t('phaseName')}</th>
                          <th className="py-2">{t('meaning')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t"><td className="py-2">≈ 0</td><td className="py-2">{t('actionPhase')}</td><td className="py-2">{t('alignmentProceed')}</td></tr>
                        <tr className="border-t"><td className="py-2">π/4→π/2</td><td className="py-2">{t('transitionPhase')}</td><td className="py-2">{t('stabilizeDecisions')}</td></tr>
                        <tr className="border-t"><td className="py-2">≈ π</td><td className="py-2">{t('inversionPhase')}</td><td className="py-2">{t('overthinkingRisk')}</td></tr>
                        <tr className="border-t"><td className="py-2">&gt; π</td><td className="py-2">{t('retrogradePhase')}</td><td className="py-2">{t('patternRepetition')}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
          
                <div>
                  <div className="text-sm font-medium mb-2">{t('legendDensity')}</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-neutral-500">
                          <th className="py-2">|Ψ|²</th>
                          <th className="py-2">{t('meaning')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t"><td className="py-2">&lt; 1</td><td className="py-2">{t('latentPotential')}</td></tr>
                        <tr className="border-t"><td className="py-2">1–4</td><td className="py-2">{t('growingCoherence')}</td></tr>
                        <tr className="border-t"><td className="py-2">4–9</td><td className="py-2">{t('coherentField')}</td></tr>
                        <tr className="border-t"><td className="py-2">&gt; 9</td><td className="py-2">{t('oversaturation')}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
          
                <div>
                  <div className="text-sm font-medium mb-2">{t('legendQuickMap')}</div>
                  <div className="grid sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-neutral-100"><div className="font-medium">{t('energy')}</div><div>{t('energyDesc')}</div></div>
                    <div className="p-3 rounded-xl bg-neutral-100"><div className="font-medium">{t('alignment')}</div><div>{t('alignmentDesc')}</div></div>
                    <div className="p-3 rounded-xl bg-neutral-100"><div className="font-medium">{t('manifestation')}</div><div>{t('manifestationDesc')}</div></div>
                  </div>
                  <div className="text-xs text-neutral-500 mt-3">{t('speculativeNote')}</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        <footer className="text-center text-xs text-neutral-500 py-6">
          {t('footer').replace('{year}', currentYear.toString())}
        </footer>
      </div>
    </div>
  );
}
