# Analys: Kundtjänstärenden — Ärendetyper & AI-potential

## Sammanfattning

Analys av 273 QA-par ur Zendesk-exporten (183 stängda ärenden, feb 2026).

**Nyckelinsikt:** Bara 19% av ärendena är rena kunskapsfrågor som kan besvaras med KB. 81% kräver antingen mänsklig åtgärd (58%) eller data-lookup i interna system (23%). En triage-agent som klassificerar och förbereder ärenden ger mer värde än en ren Q&A-bot.

## Fördelning per ärendetyp

| Typ | Antal | Andel |
|-----|-------|-------|
| Rapport/export (SIE, kassarapport, Z-rapport) | 70 | 26% |
| Övrigt/oklassificerat | 70 | 26% |
| Betalning/terminaler (WestPay, Nets) | 34 | 12% |
| Kvitton (kopior, återbetalning) | 28 | 10% |
| Felsökning | 15 | 5% |
| Konfiguration | 13 | 5% |
| Integration (Fortnox, Visma, HotSoft) | 12 | 4% |
| Användare/inlogg | 11 | 4% |
| Meny/produkter | 9 | 3% |
| Faktura/ekonomi | 8 | 3% |
| Hårdvara | 3 | 1% |

## Kan AI besvara frågan?

| Kategori | Andel | Beskrivning |
|----------|-------|-------------|
| **KB-besvarbart** | 19% | How-to-frågor som kan besvaras med dokumentationen |
| **Kräver mänsklig åtgärd** | 58% | Agenten måste göra något (exportera, fixa, konfigurera) |
| **Kräver data-lookup** | 23% | Hämta specifik data (kvitto, rapport, SIE-fil) |

## Typexempel per kategori

### KB-besvarbart (19%)
- "Hur lägger jag till en memo på en produkt?"
- "Hur kopplar jag WestPay-terminalen?"
- "Var hittar jag covers-inställningen i Domino?"
- "Kan vi använda fri rabatt eller bara fasta?"

### Kräver mänsklig åtgärd (58%)
- "Vårt internet låg nere, kan ni göra om rapporten?"
- "Terminalen funkar inte efter uppdatering"
- "Momsen ligger fel på combi-produkten"
- "Kan ni fixa ett nytt inlogg till MyTrivec?"
- "Fortnox-inläsningen gick inte igenom"

### Kräver data-lookup (23%)
- "Kan jag få kvitto 229 från 11/2?"
- "Skicka kassafilen för Shibumi 1250, 8-15 feb"
- "Kan ni skicka SIE-filen igen?"
- "Jag behöver kassarapport 250101–251231"
- "Kan jag få fakturorna som slagits ut via kassan i januari?"

## Konsekvenser för POC-design

### En ren Q&A-bot räcker inte
Med bara 19% KB-besvarbara frågor ger en ren RAG-bot begränsat värde. Majoriteten av ärendena kräver antingen åtgärd eller data-hämtning.

### Triage-agent ger mest värde
En agent som klassificerar och förbereder ärenden hjälper supportagenterna med ALLA ärendetyper:
1. **HOW-TO**: Generera färdigt svar → agenten kopierar och skickar
2. **FÖRBEREDA**: Strukturera underlag (kundinfo, problemtyp, relevant KB-kontext, förslag på steg)
3. **DATA-LOOKUP**: Strukturera begäran (vilken data, period, kund) — i framtiden via MCP

### MCP-potential (fas 2)
De 23% data-lookup-ärendena (kvitton, rapporter, SIE-filer) kan automatiseras med MCP-kopplingar:
- Trivec Backoffice API → kvitton, kassarapporter
- SIE-export-system → SIE-filer
- Zendesk API → kundinfo, ärendehistorik
- Fortnox/Visma → fakturor, bokföring

### Prioritering av MCP-integrationer (efter ärendevolym)
1. **Rapport/export-system** (26% av ärenden) — högst ROI
2. **Kvitto-system** (10%) — frekvent, ofta enkla lookups
3. **Fortnox/Visma** (4%) — komplicerat men värdefullt
4. **Zendesk API** (kundkontext) — berikar alla ärendetyper
