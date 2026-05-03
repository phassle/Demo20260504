# POC: AI-assisterad kundtjänst för Caspeco/Trivec

## Bakgrund
Caspeco hanterar flera hundra supportärenden per dag. Målet är att bygga en POC där kundtjänstrepresentanter får AI-assisterade svar baserat på befintliga manualer och kunskapsbas.

## Datakällor

### Kunskapsbas (för RAG-indexering)
- **Trivec Zendesk Help Center**: https://trivec.zendesk.com/hc/en-gb/
- **Caspeco Support-portal**: https://saportcocaspecopocswc02.z1.web.core.windows.net/
- Alla URL:er som Per redan plockat ut → placeras i `data/in/`

### Eval-data (för utvärdering)
- **ZendeskExport_20260224_175600.jsonl** — 183 stängda ärenden, 281 QA-par
- Snittlängd fråga: ~745 tecken, svar: ~563 tecken
- Täcker: Domino, SIE, Westpay, finance, configuration/reporting
- Geografisk spridning: Öst (124), Syd (45), Väst (33), Nord (18)

## Arkitektur

```
                         ┌─────────────────────────────────────┐
  Caspeco portal ───────▶│  Blob: caspeco-docs (226 filer)     │
  Zendesk HC ───────────▶│  Blob: zendesk-articles (1131 filer)│
                         └──────────────┬──────────────────────┘
                                        ▼
                         ┌─────────────────────────────────────┐
                         │  Azure AI Search (hybrid search)     │
                         └──────────────┬──────────────────────┘
                                        ▼
                         ┌─────────────────────────────────────┐
                         │  KB: kb-caspeco-support              │
                         │   ├─ ks-caspeco-docs                 │
                         │   └─ ks-zendesk-articles             │
                         └──────────────┬──────────────────────┘
                                        │
                    ┌───────────────────────────────────────┐
                    │         TRIAGE-AGENT (GPT-5-mini)     │
                    │                                       │
                    │  1. Klassificera ärendetyp             │
                    │  2. Bestäm routing                     │
                    └───┬──────────┬──────────┬─────────────┘
                        │          │          │
                        ▼          ▼          ▼
              ┌──────────┐ ┌────────────┐ ┌──────────────────┐
              │ HOW-TO   │ │ FÖRBEREDA  │ │ DATA-LOOKUP      │
              │ (19%)    │ │ (58%)      │ │ (23%)            │
              │          │ │            │ │                  │
              │ Sök KB → │ │ Sök KB →   │ │ [Framtid: MCP]  │
              │ Generera │ │ Strukturera│ │ Hämta kvitto,    │
              │ färdigt  │ │ underlag   │ │ rapport, SIE-fil │
              │ svar     │ │ åt agent   │ │ från interna     │
              └──────────┘ └────────────┘ │ system           │
                                          └──────────────────┘

Fas 1 (POC nu):   Triage + KB-svar + strukturerat underlag
Fas 2 (nästa):    MCP-koppling till interna system
Fas 3 (framtid):  Automatiserade åtgärder
```

## Ärendetyper (från analys av 273 QA-par)

| Typ | Andel | Triage-routing |
|-----|-------|----------------|
| Rapport/export (SIE, kassarapport, Z-rapport) | 26% | → FÖRBEREDA / DATA-LOOKUP |
| Betalning/terminaler (WestPay, Nets) | 12% | → HOW-TO eller FÖRBEREDA |
| Kvitton (kopior, återbetalning) | 10% | → DATA-LOOKUP |
| Felsökning | 5% | → HOW-TO eller FÖRBEREDA |
| Konfiguration | 5% | → FÖRBEREDA |
| Integration (Fortnox, Visma, HotSoft) | 4% | → FÖRBEREDA |
| Användare/inlogg | 4% | → HOW-TO eller FÖRBEREDA |
| Meny/produkter | 3% | → HOW-TO |
| Faktura/ekonomi | 3% | → DATA-LOOKUP |
| Övrigt | 26% | → FÖRBEREDA |

## Triage-agentens tre outputs

### 1. HOW-TO (~19% av ärenden)
Frågor som kan besvaras direkt med KB:
- "Hur lägger jag till en memo på en produkt?"
- "Hur kopplar jag upp en WestPay-terminal?"
- "Var hittar jag covers-inställningen?"

**Output:** Färdigt svarsförslag som agenten kan kopiera/redigera och skicka.

### 2. FÖRBEREDA (~58% av ärenden)
Frågor som kräver mänsklig åtgärd men kan förberedas:
- "Kan ni exportera om rapporten från igår?"
- "Terminalen funkar inte efter uppdatering"
- "Momsen ligger fel på combi-produkten"

**Output:** Strukturerat underlag för supportagenten:
- Ärendetyp + prioritet
- Kundinfo (restaurang, licensnummer)
- Relevant KB-kontext (t.ex. guide för att felsöka terminaler)
- Förslag på steg att ta
- Utkast till svar

### 3. DATA-LOOKUP (~23% av ärenden) — Framtid med MCP
Frågor som kräver åtkomst till interna system:
- "Kan jag få kvitto 229 från 11/2?"
- "Skicka kassafilen för Shibumi 1250, 8-15 feb"
- "Kan ni skicka SIE-filen igen?"

**POC:** Strukturera begäran (vilken data, vilken period, vilken kund).
**Framtid med MCP:** Koppla mot interna system:
- MCP → Trivec Backoffice API (kvitton, rapporter)
- MCP → SIE-export-system
- MCP → Zendesk API (kundinfo, ärendehistorik)
- MCP → Fortnox/Visma (fakturor, bokföring)

## Faser

### Fas 1: POC (nu)
- KB med 2 sources i Azure AI Foundry ✅
- Triage-agent som klassificerar + söker KB
- Genererar färdiga svar (how-to) eller strukturerat underlag (övrigt)
- Eval med 273 QA-par

### Fas 2: MCP-integration
- Koppla interna system via MCP-servrar
- Agenten kan hämta kvitton, rapporter, SIE-filer
- Kunden får snabbare svar utan manuellt arbete

### Fas 3: Automatisering
- Agenten utför åtgärder direkt (exportera rapport, skicka kvitto)
- Mänsklig agent godkänner innan utskick
- Självbetjäningsportal för vanliga frågor

## Steg-för-steg

### Steg 1: Datainsamling & förberedelse ✅
1. ~~Scrapa/ladda ner alla sidor från Zendesk HC och Caspeco-portalen~~ KLART
2. Data finns som JSON (markdown + metadata) — redo att laddas upp
3. Chunkning hanteras av Azure AI Search integrated vectorization

### Steg 2: Azure Blob Storage — upload
1. Skapa Storage Account (t.ex. `stcaspecoaikb01`)
2. Skapa container **caspeco-docs** → ladda upp 226 JSON-filer från `019cc33e...`
3. Skapa container **zendesk-articles** → ladda upp 1 131 JSON-filer från `019cc342...`

### Steg 3: Azure AI Search — indexering
1. Skapa en Azure AI Search-resurs
2. Konfigurera **indexer per container** som pekar på Blob Storage
3. Aktivera **integrated vectorization** (embedding-modell: text-embedding-ada-002 eller text-embedding-3-small)
4. Indexet får både text + vektorer → hybrid search (keyword + semantic)
5. JSON-metadata (sourceURL, language) blir sökbara fält

### Steg 4: Azure AI Foundry — Knowledge Base + Agent
1. Skapa ett projekt i Azure AI Foundry
2. Skapa en **Knowledge Base** med **2 Knowledge Sources**:
   - Source 1: **caspeco-docs** (Caspeco support-portal)
   - Source 2: **zendesk-articles** (Trivec Zendesk HC)
3. Konfigurera en agent/deployment med:
   - Modell: GPT-4o eller GPT-4o-mini
   - System prompt anpassat för Trivec/Caspeco kundtjänst
   - Grounding via Knowledge Base (söker båda sources samtidigt)
4. Testa i Foundry Playground

### Steg 4: Eval-set från Zendesk-data
1. **Extrahera QA-par** ur ZendeskExport → JSONL-format:
   ```json
   {
     "question": "<kundens fråga>",
     "ground_truth": "<agentens faktiska svar>",
     "context": "<relevant metadata/tags>"
   }
   ```
2. Filtrera bort:
   - Ärenden som bara är bilder/bilagor utan text
   - Merged/duplicerade ärenden
   - Ärenden med för kort svar (< 50 tecken)
3. **Ladda upp som eval-dataset** i Azure AI Foundry (JSONL-format)
4. Kör evaluering med inbyggda metrics:
   - **Groundedness** — svarar modellen baserat på kunskapsbasen?
   - **Relevance** — är svaret relevant för frågan?
   - **Coherence** — är svaret sammanhängande?
   - **Similarity** — liknar svaret ground truth?

### Steg 5: Iteration
- Finjustera system prompt baserat på eval-resultat
- Justera chunk-storlek och overlap
- Eventuellt filtrera/tagga dokument per produktområde (Domino, SIE, etc.)

## Azure-resurser som behövs
| Resurs | Syfte |
|--------|-------|
| Azure Blob Storage | Lagra rådokument |
| Azure AI Search | Indexering + vektorsök |
| Azure OpenAI Service | GPT-4o + embedding-modell |
| Azure AI Foundry | Orchestrering, knowledge source, eval |

## Eval-set statistik från befintlig data
- 183 ärenden, 281 QA-par tillgängliga
- Bra täckning av vanliga ämnen: Domino, betalningar, rapportering, konfiguration
- Data redan i JSONL — relativt enkelt att transformera till eval-format

## Nästa steg
- [ ] Per placerar URL-listor i `data/in/`
- [ ] Scrapa manualsidor → markdown
- [ ] Skapa eval-set script som transformerar Zendesk-data → Foundry eval-format
- [ ] Sätta upp Azure-resurser (Blob, AI Search, Foundry)

## Relevanta Microsoft Learn-resurser
- [Build a custom RAG app with Foundry SDK](https://learn.microsoft.com/en-us/azure/ai-foundry/tutorials/copilot-sdk-build-rag)
- [RAG and indexes in Microsoft Foundry](https://learn.microsoft.com/en-us/azure/foundry/concepts/retrieval-augmented-generation)
- [Evaluate Generative AI Models in Foundry](https://learn.microsoft.com/en-us/azure/foundry/how-to/evaluate-generative-ai-app)
- [Azure OpenAI Evaluations in Foundry](https://learn.microsoft.com/en-us/azure/ai-foundry/openai/how-to/evaluations)
- [Custom Evaluators](https://learn.microsoft.com/en-us/azure/foundry/concepts/evaluation-evaluators/custom-evaluators)
- [RAG and generative AI — Azure AI Search](https://learn.microsoft.com/en-us/azure/search/retrieval-augmented-generation-overview)
