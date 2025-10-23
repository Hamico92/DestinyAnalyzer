export const adviceTranslations = {
  it: {
    // Densità
    densityVeryLow: "📉 Densità |Ψ|² < 15%: probabilità manifestazione molto bassa",
    reevaluateGoal: "🔍 Rivaluta obiettivo: con <15% probabilità, vale davvero la pena investire energia?",
    considerPivot: "🔄 Considera pivot completo: cambia target o approccio radicalmente",
    densityLow: "⚠️ Densità |Ψ|² = {value} (15-30%): probabilità bassa",
    analyzeCostBenefit: "📊 Analizza costo-beneficio: energia investita vs probabilità successo",
    increaseIntensity: "⚡ Per superare 30%: aumenta |D| (intensità) o δ (reciprocità)",
    densityModerate: "📈 Densità |Ψ|² = {value} (30-50%): probabilità moderata",
    grayZone: "🎯 Zona grigia: serve 1 azione decisiva per spostare sopra 50%",
    densityGood: "✅ Densità |Ψ|² = {value} (50-100%): buona probabilità",
    maintainMomentum: "🚀 Mantieni momentum: continua azioni coerenti",
    densityHigh: "🔥 Densità |Ψ|² = {value}: alta coerenza campo",
    actNowFavorable: "⚡ Agisci ORA: momento favorevole, non rimandare",
    densityOversaturated: "⚡ Densità |Ψ|² > 4: possibile sovrasaturazione",
    slowDownBurnout: "🧘 Rallenta: troppa intensità può generare resistenza/burnout",
    
    // Overthinking
    noOverthinking: "✅ P=0: energia non invertita, nessun overthinking rilevato",
    overthinkingActive: "🧠 P=1: overthinking attivo, inversione energetica (-1)^P = -1",
    decisionWindow: "⏰ Finestra decisionale: 25 min pensiero MAX, poi azione obbligatoria",
    stopAdviceSeeking: "🚫 Stop ricerca consiglio: decide CHI agisce, non chi pensa",
    
    // Reciprocity
    reciprocityAlmostNull: "⚠️ δ={value} < 0.2: connessione/reciprocità quasi nulla",
    testReciprocity: "🤝 Test reciprocità: proponi 1 interazione e osserva risposta entro 48h",
    acceptReality: "❌ Se nessuna risposta → accetta realtà e redirect energia altrove",
    reciprocityLow: "📉 δ={value} (0.2-0.4): reciprocità bassa",
    increaseDeltaAction: "📈 Aumenta δ: proponi 1 scambio paritario concreto (non unilaterale)",
    reciprocityBalanced: "🔗 δ={value} (0.4-0.7): reciprocità equilibrata",
    reciprocityHigh: "⚡ δ={value} > 0.7: alta sincronia/connessione",
    paradoxHighDelta: "⚠️ PARADOSSO: δ alto ma |Ψ|² basso → altri fattori bloccano",
    analyzeBlocking: "🔍 Analizza: se δ è alto ma risultato basso, controlla sgn(D), K, B",
    
    // Direction
    directionPositive: "➕ sgn(D)={value} positivo: direzione costruttiva",
    directionNeutral: "⚖️ sgn(D)={value} neutro: azioni senza direzione chiara",
    defineDirection: "🎯 Definisci direzione: 1 azione esplicitamente costruttiva entro 24h",
    directionNegative: "➖ sgn(D)={value} negativo: pattern auto-sabotaggio",
    stopDestructive: "🛑 STOP 1 comportamento distruttivo: identifica e blocca",
    substituteNegative: "🔄 Sostituisci: per ogni azione negativa, 1 micro-azione +",
    
    // Intensity
    intensityTooLow: "📊 |D|={value} < 2: intensità troppo bassa",
    increaseIntensityAction: "⚡ Aumenta |D|: esegui 1 azione livello ≥4 entro 24h",
    intensitySufficient: "📈 |D|={value} (2-5): intensità sufficiente",
    intensityHigh: "🔥 |D|={value} alta: impegno significativo",
    intensityExcessive: "⚠️ |D|={value} > 8: possibile iperattività/burnout",
    moderateIntensity: "🧘 Modera intensità: qualità > quantità nelle prossime 48h",
    
    // Karma
    karmaNegative: "⚖️ K={value} < 0.8: karma negativo, promesse rotte pesano",
    restoreKarma: "✅ Ripristina K: completa 1 impegno aperto o ripara 1 promessa",
    karmaNeutral: "⚖️ K={value} neutro: storia azioni equilibrata",
    karmaPositive: "🔁 K={value} > 1.5: amplificazione positiva, azioni passate aiutano",
    
    // Network
    networkNegative: "👥 C(N)={value} < -0.3: influenza network negativa",
    networkDetox: "🔄 Detox rete: -50% esposizione fonti tossiche per 7 giorni",
    addMentor: "➕ Aggiungi 1 mentor/contatto positivo entro 10 giorni",
    networkNeutral: "👥 C(N)={value} neutro: network non influisce significativamente",
    networkPositive: "👥 C(N)={value} > 0.3: supporto network positivo",
    
    // Bifurcation
    bifurcationCritical: "🔀 B={value} ≥ 3: momento critico/biforcazione",
    decisionTimeframe: "⏱️ Decisione entro 48-72h: finestra opportunità o rischio imminente",
    slowIsSmooth: "🎯 Regola 'slow is smooth': pensa chiaro, poi agisci deciso",
    bifurcationModerate: "⚖️ B={value} (1.5-3): complessità moderata",
    
    // Synchronicity
    synchronicityRelevant: "✨ J={value} ≥ 2: pattern sincronicità rilevanti",
    leverageMomentum: "🎯 Sfrutta momentum: agisci mentre 'vento è favorevole'",
    synchronicityLow: "📉 J={value} < 0.5: zero segnali sincronici",
    
    // Phase
    phaseAligned: "🎯 Fase ≈ 0: allineamento ciclico, momento azione",
    phaseInversion: "🔄 Fase ≈ π: inversione ciclica, possibile auto-sabotaggio",
    waitBeforeDecisions: "⏳ Aspetta 3-7 giorni prima di decisioni critiche",
    phaseRetrograde: "↩️ Fase > π: retrograda, ripetizione pattern passati",
    reviewPatterns: "🔍 Rivedi K(D) e sgn(D): stai ripetendo errori?",
    
    // Critical Interactions
    illusionParadox: "💔 PARADOSSO: δ={delta} alto ma |Ψ|²={density} basso",
    connectionBlocked: "🔍 Connessione c'è ma bloccata: analizza sgn(D), B(t), K(D)",
    acceptHighDelta: "❌ Se altri fattori immutabili → accetta che δ alto NON basta",
    energyWaste: "⚠️ SPRECO: alta intensità (|D|={intensity}) in direzione negativa",
    stopImmediately: "🛑 STOP immediato: stai danneggiando attivamente con impegno alto",
    criticalParalysis: "🚨 PARALISI CRITICA: overthinking in momento decisivo",
    oneHourTimer: "⏰ Timer 1 ora: decidi ADESSO, deadline non negoziabile",
    inefficiency: "💸 INEFFICIENZA: alta energia su probabilità <20%",
    redirectUrgent: "🔄 Redirect urgente: stesso sforzo su target con >40% probabilità",
    nextSmallAction: "📋 Prossima azione più piccola possibile: esegui OGGI entro 24h",
  },
  
  en: {
    // Density
    densityVeryLow: "📉 Density |Ψ|² < 15%: very low manifestation probability",
    reevaluateGoal: "🔍 Reevaluate goal: with <15% probability, is it worth investing energy?",
    considerPivot: "🔄 Consider complete pivot: radically change target or approach",
    densityLow: "⚠️ Density |Ψ|² = {value} (15-30%): low probability",
    analyzeCostBenefit: "📊 Analyze cost-benefit: energy invested vs success probability",
    increaseIntensity: "⚡ To exceed 30%: increase |D| (intensity) or δ (reciprocity)",
    densityModerate: "📈 Density |Ψ|² = {value} (30-50%): moderate probability",
    grayZone: "🎯 Gray zone: need 1 decisive action to move above 50%",
    densityGood: "✅ Density |Ψ|² = {value} (50-100%): good probability",
    maintainMomentum: "🚀 Maintain momentum: continue coherent actions",
    densityHigh: "🔥 Density |Ψ|² = {value}: high field coherence",
    actNowFavorable: "⚡ Act NOW: favorable moment, don't postpone",
    densityOversaturated: "⚡ Density |Ψ|² > 4: possible oversaturation",
    slowDownBurnout: "🧘 Slow down: too much intensity can generate resistance/burnout",
    
    // Overthinking
    noOverthinking: "✅ P=0: energy not inverted, no overthinking detected",
    overthinkingActive: "🧠 P=1: active overthinking, energy inversion (-1)^P = -1",
    decisionWindow: "⏰ Decision window: 25 min thinking MAX, then mandatory action",
    stopAdviceSeeking: "🚫 Stop seeking advice: the one who acts decides, not the one who thinks",
    
    // Reciprocity
    reciprocityAlmostNull: "⚠️ δ={value} < 0.2: connection/reciprocity almost null",
    testReciprocity: "🤝 Reciprocity test: propose 1 interaction and observe response within 48h",
    acceptReality: "❌ If no response → accept reality and redirect energy elsewhere",
    reciprocityLow: "📉 δ={value} (0.2-0.4): low reciprocity",
    increaseDeltaAction: "📈 Increase δ: propose 1 concrete equal exchange (not unilateral)",
    reciprocityBalanced: "🔗 δ={value} (0.4-0.7): balanced reciprocity",
    reciprocityHigh: "⚡ δ={value} > 0.7: high synchrony/connection",
    paradoxHighDelta: "⚠️ PARADOX: high δ but low |Ψ|² → other factors blocking",
    analyzeBlocking: "🔍 Analyze: if δ is high but result is low, check sgn(D), K, B",
    
    // Direction
    directionPositive: "➕ sgn(D)={value} positive: constructive direction",
    directionNeutral: "⚖️ sgn(D)={value} neutral: actions without clear direction",
    defineDirection: "🎯 Define direction: 1 explicitly constructive action within 24h",
    directionNegative: "➖ sgn(D)={value} negative: self-sabotage pattern",
    stopDestructive: "🛑 STOP 1 destructive behavior: identify and block",
    substituteNegative: "🔄 Substitute: for each negative action, 1 micro-action +",
    
    // Intensity
    intensityTooLow: "📊 |D|={value} < 2: intensity too low",
    increaseIntensityAction: "⚡ Increase |D|: execute 1 action level ≥4 within 24h",
    intensitySufficient: "📈 |D|={value} (2-5): sufficient intensity",
    intensityHigh: "🔥 |D|={value} high: significant commitment",
    intensityExcessive: "⚠️ |D|={value} > 8: possible hyperactivity/burnout",
    moderateIntensity: "🧘 Moderate intensity: quality > quantity in next 48h",
    
    // Karma
    karmaNegative: "⚖️ K={value} < 0.8: negative karma, broken promises weigh",
    restoreKarma: "✅ Restore K: complete 1 open commitment or repair 1 promise",
    karmaNeutral: "⚖️ K={value} neutral: balanced action history",
    karmaPositive: "🔁 K={value} > 1.5: positive amplification, past actions help",
    
    // Network
    networkNegative: "👥 C(N)={value} < -0.3: negative network influence",
    networkDetox: "🔄 Network detox: -50% exposure to toxic sources for 7 days",
    addMentor: "➕ Add 1 mentor/positive contact within 10 days",
    networkNeutral: "👥 C(N)={value} neutral: network doesn't significantly influence",
    networkPositive: "👥 C(N)={value} > 0.3: positive network support",
    
    // Bifurcation
    bifurcationCritical: "🔀 B={value} ≥ 3: critical moment/bifurcation",
    decisionTimeframe: "⏱️ Decision within 48-72h: opportunity window or imminent risk",
    slowIsSmooth: "🎯 'Slow is smooth' rule: think clearly, then act decisively",
    bifurcationModerate: "⚖️ B={value} (1.5-3): moderate complexity",
    
    // Synchronicity
    synchronicityRelevant: "✨ J={value} ≥ 2: relevant synchronicity patterns",
    leverageMomentum: "🎯 Leverage momentum: act while 'wind is favorable'",
    synchronicityLow: "📉 J={value} < 0.5: zero synchronic signals",
    
    // Phase
    phaseAligned: "🎯 Phase ≈ 0: cyclic alignment, action moment",
    phaseInversion: "🔄 Phase ≈ π: cyclic inversion, possible self-sabotage",
    waitBeforeDecisions: "⏳ Wait 3-7 days before critical decisions",
    phaseRetrograde: "↩️ Phase > π: retrograde, past pattern repetition",
    reviewPatterns: "🔍 Review K(D) and sgn(D): are you repeating mistakes?",
    
    // Critical Interactions
    illusionParadox: "💔 PARADOX: δ={delta} high but |Ψ|²={density} low",
    connectionBlocked: "🔍 Connection exists but blocked: analyze sgn(D), B(t), K(D)",
    acceptHighDelta: "❌ If other factors unchangeable → accept that high δ is NOT enough",
    energyWaste: "⚠️ WASTE: high intensity (|D|={intensity}) in negative direction",
    stopImmediately: "🛑 STOP immediately: you're actively damaging with high effort",
    criticalParalysis: "🚨 CRITICAL PARALYSIS: overthinking at decisive moment",
    oneHourTimer: "⏰ 1-hour timer: decide NOW, non-negotiable deadline",
    inefficiency: "💸 INEFFICIENCY: high energy on <20% probability",
    redirectUrgent: "🔄 Urgent redirect: same effort on target with >40% probability",
    nextSmallAction: "📋 Next smallest possible action: execute TODAY within 24h",
  }
};
