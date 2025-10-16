# Destiny Ψ Analyzer (Next.js + Tailwind)

App per analizzare un prompt con la formula speculativa:
```
Ψ(t) = Σ[(-1)^P · δ(i,j) + sgn(D) · |D| · K(D)] · e^(−iΩt) + ξ(t) · C(N) · [1 + B(t) · J(t)]
```
> Uso riflessivo/educativo. Non è un modello scientifico.

## Avvio locale
```bash
npm install
npm run dev
```
Apri http://localhost:3000

## Deploy su Vercel
- Push su GitHub (o GitLab/Bitbucket)
- Importa il repo su https://vercel.com e deploy

## Struttura
- `app/page.tsx`: interfaccia principale
- `components/ui/*`: componenti UI minimi (compatibili con gli import mostrati)
