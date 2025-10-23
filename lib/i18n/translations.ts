export const translations = {
  it: {
    // Header
    title: "Destiny Ψ Analyzer",
    exportJson: "Esporta JSON",
    
    // Main Input Section
    promptLabel: "Scrivi un prompt (situazione, obiettivo, contesto)",
    promptPlaceholder: "Esempio:\n\nVoglio cambiare lavoro entro 3 mesi ma continuo a rimandare. Il mio team è diviso. Ho notato strane coincidenze positive nelle ultime due settimane...",
    analyzeButton: "Analizza",
    example1: "Esempio 1",
    example2: "Esempio 2", 
    example3: "Esempio 3",
    example4: "Esempio 4",
    
    // Tabs
    tabResults: "Risultati Ψ",
    tabParams: "Parametri",
    tabCharts: "Grafici",
    tabSuggestions: "Suggerimenti",
    tabFormula: "Formula",
    tabLegend: "Legenda Ψ",
    
    // Results Tab
    amplitude: "|Ψ(t)| (ampiezza)",
    phase: "Arg(Ψ) (fase)",
    density: "Densità |Ψ|²",
    densitySubtext: "Probabilità relativa di manifestazione",
    currentQuality: "Qualità attuale",
    noInversion: "Nessuna inversione (P=0)",
    inversion: "Inversione (P=1)",
    positiveDirection: "Direzione +",
    neutralDirection: "Direzione ±/−",
    speculativeNote: "Nota: modello speculativo a scopo riflessivo.",
    
    // Parameters Tab
    overthinking: "Overthinking P",
    connection: "δ(i,j) — Connessione",
    direction: "sgn(D) — Direzione decisioni",
    intensity: "|D| — Intensità decisioni",
    amplification: "K(D) — Amplificazione",
    serendipity: "ξ(t) — Casualità favorevole",
    networkInfluence: "C(N) — Influenza del network",
    bifurcation: "B(t) — Biforcazione",
    synchronicity: "J(t) — Sincronicità junghiana",
    frequency: "Ω — frequenza (rad/giorno)",
    daysInCycle: "t — giorni nel ciclo",
    days: "giorni",
    current: "Attuale",
    destructive: "distruttiva",
    constructive: "costruttiva",
    
    // Parameter hints
    hintOverthinking: "Inversione da overthinking (0→+1, 1→-1)",
    hintConnection: "Connessione/sincronicità interpersonale",
    hintDirection: "Direzione etica/funzionale della decisione",
    hintIntensity: "Intensità della decisione",
    hintAmplification: "Amplificazione/karma delle azioni",
    hintRealPart: "Oscillatore ciclico (componente reale)",
    hintImaginaryPart: "Oscillatore ciclico (componente immaginaria)",
    hintSerendipity: "Casualità/serendipità percepita",
    hintNetwork: "Influenza del network (−1↔+1)",
    hintBifurcation: "Criticità/biforcazione del momento",
    hintSynchronicity: "Indice di sincronicità junghiana",
    
    // Table Headers
    term: "Termine",
    value: "Valore",
    hint: "Hint",
    
    // Charts Tab
    radarTitle: "Radar parametri normalizzati",
    contributionsTitle: "Contributi (approssimati) ai termini",
    weight: "Peso",
    
    // Suggestions Tab
    prosTitle: "✅ PRO — Elementi favorevoli",
    consTitle: "⚠️ CONTRO — Rischi e ostacoli",
    actionsTitle: "🎯 AZIONI — Passi concreti",
    noPros: "Nessun elemento favorevole rilevato con parametri attuali",
    noCons: "Nessun rischio critico rilevato con parametri attuali",
    
    // Formula Tab
    formulaTitle: "Formula generale",
    formulaDescription: "Questa app implementa una <strong>metafora matematica</strong> per aiutare il ragionamento decisionale: non è un modello scientifico, e i risultati non sono predizioni. I parametri si possono stimare dal prompt e poi perfezionare manualmente.",
    formulaP: "P: overthinking (0/1) – inversione energetica.",
    formulaDelta: "δ(i,j): connessione/sincronia interpersonale.",
    formulaSgn: "sgn(D), |D|, K(D): direzione, intensità e amplificazione delle azioni.",
    formulaExp: "e^{-iΩt}: cicli personali (Ω) e fase (t).",
    formulaXi: "ξ(t), C(N): casualità e influenza del network.",
    formulaB: "B(t), J(t): momenti critici e sincronicità.",
    formulaTip: "Suggerimento: salva il JSON, ripeti l'analisi ogni settimana per vedere come cambia |Ψ|².",
    
    // Legend Tab
    legendTitle: "Legenda del Valore Ψ(t)",
    legendAmplitude: "1) Ampiezza |Ψ(t)| — Intensità complessiva del potenziale",
    legendPhase: "2) Fase Arg(Ψ) — Stato ciclico e orientamento temporale",
    legendDensity: "3) Densità |Ψ|² — Potenziale manifestato",
    legendQuickMap: "4) Mappa rapida",
    interval: "Intervallo",
    interpretation: "Interpretazione",
    action: "Azione",
    phaseRad: "Arg(Ψ) (rad)",
    phaseName: "Fase",
    meaning: "Significato",
    energy: "Energia",
    energyDesc: "|Ψ| — intensità del campo",
    alignment: "Allineamento",
    alignmentDesc: "Arg(Ψ) — timing e fase",
    manifestation: "Manifestazione",
    manifestationDesc: "|Ψ|² — probabilità relativa",
    
    // Legend values
    weakField: "Campo debole, dispersione",
    focusGoal: "Focalizza 1 obiettivo",
    neutralStability: "Stabilità neutra",
    increaseDelta: "Aumenta δ(i,j) con feedback",
    partialCoherence: "Coerenza parziale",
    maintainRhythm: "Mantieni ritmo e direzione",
    highCoherence: "Coerenza elevata",
    actNow: "Agisci ora",
    excessiveResonance: "Risonanza eccessiva",
    slowDown: "Rallenta, evita saturazione",
    actionPhase: "Azione",
    alignmentProceed: "Allineamento, procedi",
    transitionPhase: "Transizione",
    stabilizeDecisions: "Stabilizza decisioni",
    inversionPhase: "Inversione",
    overthinkingRisk: "Overthinking, rischio auto-sabotaggio",
    retrogradePhase: "Retrograda",
    patternRepetition: "Ripetizione pattern: rivedi K(D), sgn(D)",
    latentPotential: "Potenziale latente: serve azione",
    growingCoherence: "Coerenza in crescita",
    coherentField: "Campo coerente: alta probabilità",
    oversaturation: "Sovrasaturazione: rischio interferenze",
    
    // Footer
    footer: "© {year} Destiny Ψ Analyzer — uso riflessivo/educativo.",
    
    // Preset Examples
    preset1Name: "Esempio 1 — Daniele & Sofia",
    preset2Name: "Esempio 2 — Carriera",
    preset3Name: "Esempio 3 — Startup",
    preset4Name: "Esempio 4 — Benessere",
    
    preset1Text: `SCENARIO: Daniele e la conquista di Sofia.

Contesto: Daniele (29, architetto) ha incontrato Sofia (27, grafica freelance) tre settimane fa a una mostra. Hanno parlato a lungo e si sono scambiati i numeri. Da allora Daniele è bloccato dall'ansia: riscrive ogni messaggio molte volte, chiede consigli a più amici, pensa continuamente a lei ma non propone un incontro reale. Alcune sincronicità ci sono state (stessi messaggi allo stesso momento, gusti musicali in comune), ma lui rimanda sempre l'azione. Vorrebbe capire come sbloccare la situazione, scegliere il momento giusto e agire con autenticità per invitarla a uscire concretamente.`,
    
    preset2Text: `Valuto se lasciare il mio impiego stabile per un ruolo più sfidante in un'altra azienda entro 60 giorni. Ho feedback positivi dal network, ma tendenza a rimandare le candidature e a perfezionare troppo il CV. Vorrei capire come massimizzare il timing e ridurre l'overthinking per inviare 5 candidature strategiche e preparare 2 colloqui simulati.`,
    
    preset3Text: `Sto lanciando una startup SaaS: ho un MVP funzionante e due potenziali mentor. Tre clienti pilota sono interessati. Devo decidere se aprire adesso la beta privata o attendere altre feature. Ho segnali di sincronicità ricorrenti e una scadenza fiera tra 30 giorni. Voglio un piano d'azione chiaro per massimizzare l'effetto rete e la coerenza delle decisioni.`,
    
    preset4Text: `Voglio ristrutturare le mie abitudini di benessere: sonno, allenamento, alimentazione. Ho tentato più volte ma ricado nella routine. Ho un gruppo di amici pronti a supportarmi e un personal trainer disponibile. Vorrei definire micro-azioni settimanali, gestire i momenti di biforcazione (cene, viaggi) e sfruttare le sincronicità per restare in rotta per 8 settimane.`,
  },
  
  en: {
    // Header
    title: "Destiny Ψ Analyzer",
    exportJson: "Export JSON",
    
    // Main Input Section
    promptLabel: "Write a prompt (situation, objective, context)",
    promptPlaceholder: "Example:\n\nI want to change jobs within 3 months but keep procrastinating. My team is divided. I've noticed strange positive coincidences in the last two weeks...",
    analyzeButton: "Analyze",
    example1: "Example 1",
    example2: "Example 2",
    example3: "Example 3",
    example4: "Example 4",
    
    // Tabs
    tabResults: "Ψ Results",
    tabParams: "Parameters",
    tabCharts: "Charts",
    tabSuggestions: "Suggestions",
    tabFormula: "Formula",
    tabLegend: "Ψ Legend",
    
    // Results Tab
    amplitude: "|Ψ(t)| (amplitude)",
    phase: "Arg(Ψ) (phase)",
    density: "Density |Ψ|²",
    densitySubtext: "Relative manifestation probability",
    currentQuality: "Current quality",
    noInversion: "No inversion (P=0)",
    inversion: "Inversion (P=1)",
    positiveDirection: "Direction +",
    neutralDirection: "Direction ±/−",
    speculativeNote: "Note: speculative model for reflective purposes.",
    
    // Parameters Tab
    overthinking: "Overthinking P",
    connection: "δ(i,j) — Connection",
    direction: "sgn(D) — Decision direction",
    intensity: "|D| — Decision intensity",
    amplification: "K(D) — Amplification",
    serendipity: "ξ(t) — Favorable randomness",
    networkInfluence: "C(N) — Network influence",
    bifurcation: "B(t) — Bifurcation",
    synchronicity: "J(t) — Jungian synchronicity",
    frequency: "Ω — frequency (rad/day)",
    daysInCycle: "t — days in cycle",
    days: "days",
    current: "Current",
    destructive: "destructive",
    constructive: "constructive",
    
    // Parameter hints
    hintOverthinking: "Overthinking inversion (0→+1, 1→-1)",
    hintConnection: "Interpersonal connection/synchronicity",
    hintDirection: "Ethical/functional decision direction",
    hintIntensity: "Decision intensity",
    hintAmplification: "Action amplification/karma",
    hintRealPart: "Cyclic oscillator (real component)",
    hintImaginaryPart: "Cyclic oscillator (imaginary component)",
    hintSerendipity: "Perceived randomness/serendipity",
    hintNetwork: "Network influence (−1↔+1)",
    hintBifurcation: "Moment criticality/bifurcation",
    hintSynchronicity: "Jungian synchronicity index",
    
    // Table Headers
    term: "Term",
    value: "Value",
    hint: "Hint",
    
    // Charts Tab
    radarTitle: "Normalized parameters radar",
    contributionsTitle: "Term contributions (approximate)",
    weight: "Weight",
    
    // Suggestions Tab
    prosTitle: "✅ PROS — Favorable elements",
    consTitle: "⚠️ CONS — Risks and obstacles",
    actionsTitle: "🎯 ACTIONS — Concrete steps",
    noPros: "No favorable elements detected with current parameters",
    noCons: "No critical risks detected with current parameters",
    
    // Formula Tab
    formulaTitle: "General formula",
    formulaDescription: "This app implements a <strong>mathematical metaphor</strong> to aid decision-making reasoning: it's not a scientific model, and results are not predictions. Parameters can be estimated from the prompt and then manually refined.",
    formulaP: "P: overthinking (0/1) – energy inversion.",
    formulaDelta: "δ(i,j): interpersonal connection/synchrony.",
    formulaSgn: "sgn(D), |D|, K(D): direction, intensity and action amplification.",
    formulaExp: "e^{-iΩt}: personal cycles (Ω) and phase (t).",
    formulaXi: "ξ(t), C(N): randomness and network influence.",
    formulaB: "B(t), J(t): critical moments and synchronicity.",
    formulaTip: "Tip: save the JSON, repeat the analysis weekly to see how |Ψ|² changes.",
    
    // Legend Tab
    legendTitle: "Ψ(t) Value Legend",
    legendAmplitude: "1) Amplitude |Ψ(t)| — Overall potential intensity",
    legendPhase: "2) Phase Arg(Ψ) — Cyclic state and temporal orientation",
    legendDensity: "3) Density |Ψ|² — Manifested potential",
    legendQuickMap: "4) Quick map",
    interval: "Range",
    interpretation: "Interpretation",
    action: "Action",
    phaseRad: "Arg(Ψ) (rad)",
    phaseName: "Phase",
    meaning: "Meaning",
    energy: "Energy",
    energyDesc: "|Ψ| — field intensity",
    alignment: "Alignment",
    alignmentDesc: "Arg(Ψ) — timing and phase",
    manifestation: "Manifestation",
    manifestationDesc: "|Ψ|² — relative probability",
    
    // Legend values
    weakField: "Weak field, dispersion",
    focusGoal: "Focus on 1 objective",
    neutralStability: "Neutral stability",
    increaseDelta: "Increase δ(i,j) with feedback",
    partialCoherence: "Partial coherence",
    maintainRhythm: "Maintain rhythm and direction",
    highCoherence: "High coherence",
    actNow: "Act now",
    excessiveResonance: "Excessive resonance",
    slowDown: "Slow down, avoid saturation",
    actionPhase: "Action",
    alignmentProceed: "Alignment, proceed",
    transitionPhase: "Transition",
    stabilizeDecisions: "Stabilize decisions",
    inversionPhase: "Inversion",
    overthinkingRisk: "Overthinking, self-sabotage risk",
    retrogradePhase: "Retrograde",
    patternRepetition: "Pattern repetition: review K(D), sgn(D)",
    latentPotential: "Latent potential: action needed",
    growingCoherence: "Growing coherence",
    coherentField: "Coherent field: high probability",
    oversaturation: "Oversaturation: interference risk",
    
    // Footer
    footer: "© {year} Destiny Ψ Analyzer — reflective/educational use.",
    
    // Preset Examples
    preset1Name: "Example 1 — Daniel & Sofia",
    preset2Name: "Example 2 — Career",
    preset3Name: "Example 3 — Startup",
    preset4Name: "Example 4 — Wellness",
    
    preset1Text: `SCENARIO: Daniel and winning over Sofia.

Context: Daniel (29, architect) met Sofia (27, freelance graphic designer) three weeks ago at an exhibition. They talked at length and exchanged numbers. Since then Daniel has been blocked by anxiety: he rewrites every message multiple times, asks multiple friends for advice, thinks about her constantly but doesn't propose a real meeting. Some synchronicities have occurred (same messages at the same time, shared musical tastes), but he always postpones action. He wants to understand how to unblock the situation, choose the right moment and act authentically to actually ask her out.`,
    
    preset2Text: `I'm evaluating whether to leave my stable job for a more challenging role at another company within 60 days. I have positive feedback from my network, but tend to postpone applications and over-perfect my CV. I want to understand how to maximize timing and reduce overthinking to send 5 strategic applications and prepare 2 mock interviews.`,
    
    preset3Text: `I'm launching a SaaS startup: I have a working MVP and two potential mentors. Three pilot customers are interested. I need to decide whether to open the private beta now or wait for more features. I have recurring synchronicity signals and a trade show deadline in 30 days. I want a clear action plan to maximize network effect and decision coherence.`,
    
    preset4Text: `I want to restructure my wellness habits: sleep, training, nutrition. I've tried multiple times but fall back into routine. I have a group of friends ready to support me and a personal trainer available. I want to define weekly micro-actions, manage bifurcation moments (dinners, trips) and leverage synchronicities to stay on track for 8 weeks.`,
  }
};

export type Language = 'it' | 'en';
export type TranslationKey = keyof typeof translations.it;
