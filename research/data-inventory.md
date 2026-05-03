# Data-inventering: Kunskapsbas + Eval-set

## Sammanfattning

| Källa | Filer | Ord | Format |
|-------|-------|-----|--------|
| Caspeco support-portal | 226 sidor | ~81 000 ord | JSON (markdown + metadata) + MD |
| Trivec Zendesk Help Center | 1 131 sidor | ~512 000 ord | JSON (markdown + metadata) + MD |
| Zendesk ärenden (eval-data) | 183 ärenden → 273 QA-par | — | JSONL |
| **Totalt kunskapsbas** | **1 357 sidor** | **~593 000 ord** | |

## Export-format

Varje scrape finns i två varianter:
- **JSON-mapp** (`019cc33e...`): Varje sida som `.json` med `{"markdown": "...", "metadata": {...}}`
- **MD-mapp** (`019cc33e... 2`): Samma sidor som ren `.md` (markdown-only)

→ **MD-filerna är redo att ladda direkt till Azure Blob Storage** utan konvertering.

## Caspeco Support-portal (226 sidor)

Täcker Dominos interna dokumentation:
- Using Domino, menyer, produkttyper, vouchers
- Nätverkskrav, felsökning (Nets, Yuno POS, skrivare)
- WestPay-terminaler (C150, C100+)
- KDS-enheter, Glory cashbox
- Peppol, svenska fiskala krav (kontrollbox)
- Insights/rapportering
- Alla sidor på engelska

## Trivec Zendesk Help Center (1 131 sidor)

Flerspråkig kunskapsbas:
- 351 sidor engelska
- 308 sidor svenska
- 232 sidor franska
- 7 sidor holländska
- 233 övrigt/oklassificerat

8 kategorier (100–109), täcker samma ämnesområden som Caspeco-portalen plus:
- Handy-enheter, beställningsflöden, betalning
- AutoAddons, direktförsäljning
- Inloggning, användare

### Rekommendation för POC:
Filtrera på **svenska + engelska** artiklar (659 sidor) för att undvika brus från franska/holländska.

## Eval-dataset (redan genererat)

Fil: `data/out/eval_dataset.jsonl`
- 273 QA-par i Azure AI Foundry-format
- Fält: `question`, `ground_truth`, `context`
- Kategorier: Domino (196), övrigt (44), rapportering (18), SIE (11), Westpay (4)

## Nästa steg för Azure-upload

1. **Blob Storage**: Ladda upp MD-filerna från `019cc33e... 2` och `019cc342... 2` mapparna
2. **Azure AI Search**: Indexera med integrated vectorization
3. **Filtrera språk**: Överväg att bara ta med sv + en för POC:en
4. **Eval**: Ladda upp `eval_dataset.jsonl` i Foundry Evaluations
