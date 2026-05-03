# Slack-tråd: Bordsnoteringar i floor plan

**Kanal:** `#produkt-caspeco-fe`
**Datum:** 2026-05-02
**Deltagare:** Anna Lindqvist (PM), Erik Dahlberg (Tech Lead), Sofia Berg (UX), Marcus Nilsson (CS), Lina Holm (kund — Restaurang Stensjö)

---

**Anna Lindqvist** *14:02*
Hej alla 👋 — vi har fått in samma feedback från tre olika kunder den här veckan. Servitörerna saknar ett snabbt sätt att klistra på en notering på ett bord. Typ *"VIP — chefen kommer förbi"*, *"firar 50-årsdag, kommer med tårta"*, eller *"glutenallergi på plats 3"*. Idag löser de det med post-it-lappar bakom baren eller skriker tvärs över lokalen. Tänkte vi tar en snabbtitt på om vi kan bygga in det som en mini-feature i floor plan-vyn?

**Lina Holm** *14:05*
Ja precis det här. Vi har en whiteboard i köket där vi skriver upp speciella saker per bord och hälften av tiden glömmer någon att radera den när bordet vänts. Kaos en fredagskväll.

**Erik Dahlberg** *14:11*
Låter rimligt scope-mässigt. Tänker högt: en `note: string | null` på bord-entiteten + ett litet ✏️-icon på bordskortet i floor plan, klick öppnar en popover med textarea + spara/rensa-knapp. Borde inte vara mer än någon timmes jobb om vi håller det enkelt.

**Sofia Berg** *14:14*
Vänta innan vi spikar UI:t — några frågor:
1. Är noteringen synlig i floor plan-vyn direkt eller bara när man hovrar/klickar på bordet?
2. Om den syns direkt — hur mycket text? Truncating? Fri textarea eller max 60 tecken?
3. Ska vi ha kategorier (VIP / allergi / firande / annat) eller är det bara fritext?

**Anna Lindqvist** *14:17*
Bra frågor. Min instinkt är fritext — kategorier blir ett produkt-kommittémöte i sig. Men Marcus, vad säger kunderna?

**Marcus Nilsson** *14:22*
Mixat. Två av tre kunder pratar om allergier specifikt och då vill man absolut att det syns *direkt* utan att klicka — det är en patientsäkerhetsfråga nästan. Den tredje kunden (Stensjö, hej Lina 👋) tänker mer fritext-lapp.

**Lina Holm** *14:24*
Ja vi vill kunna skriva vad som helst. Allergi syns ändå redan i bokningssystemet så det är inte primärt det.

**Erik Dahlberg** *14:30*
Då har vi en konflikt. Antingen:
(a) fritext, syns i förkortad form direkt på bordskortet
(b) kategorier med ikoner (🥜 allergi, ⭐ VIP, 🎉 firande) + fritext under
(c) bara fritext, dolt bakom hover/klick — minimalistiskt

Jag skulle säga (a) men jag är inte UX. ¯\\_(ツ)_/¯

**Sofia Berg** *14:33*
(a) är pragmatiskt men då måste vi bestämma trunkeringsregel. 30 tecken? Och vad händer på små skärmar (tablet i lokalen)?

**Anna Lindqvist** *14:38*
Vi parkerar UI-detaljerna en sekund. Andra frågor som måste avgöras:
- **Vem får skriva?** Alla servitörer eller bara hovmästare/manager?
- **Vem får radera?** Samma som skriver, eller får vem som helst radera?
- **Persistens:** Försvinner noteringen automatiskt när bordet vänts (gäst checkat ut)? Eller hänger den kvar tills någon manuellt rensar?
- **Historik:** Vill vi se vem som skrev vad, när? Ångerknapp?

**Marcus Nilsson** *14:42*
Från support-ärenden: kunder vill *aldrig* att noteringar hänger kvar mellan besök. Det är poängen — det är situationsbundet. Auto-rensa när bordet vänts.

**Lina Holm** *14:44*
Håller med. Däremot vore det bra om jag som ägare kunde se i efterhand "vilka noteringar skrevs igår" — för uppföljning. Men det är inte krav nu.

**Erik Dahlberg** *14:48*
Auto-rensa = vi behöver definiera "bordet är vänt". Idag har vi ju ingen explicit checkout-event på bord-objektet, det går via bokningen. Är det `booking.status === 'completed'` som triggar rensning, eller när bordet sätts till status `available` igen i floor plan? Olika tidpunkter.

**Sofia Berg** *14:51*
Och om noteringen är ett varningssystem (allergi) så vill man absolut inte att den försvinner mitt under måltiden om någon råkar peta på status-knappen. Behöver tänka igenom edge cases.

**Anna Lindqvist** *14:55*
OK jag känner att vi snurrar lite. Jag drar ihop en kort PRD och kör en grilling-session med agenten innan vi spikar något. Mailar ihop frågorna ovan + det Sofia tar upp om edge cases.

Tentativt scope för MVP:
- Fritext på bord (max 200 tecken)
- Synlighet: ✏️-icon på bordskort, klick → popover
- Trunkerad preview direkt under bordsnummer (30 tecken)
- Auto-rensa: TBD — antingen vid bokning completed eller vid manuell "frigör bord"
- Behörigheter: TBD

Ska vi sikta på att ha det i staging till slutet av nästa vecka? Erik?

**Erik Dahlberg** *14:58*
Funkar för mig om vi kan hålla det till en fritext-kolumn + en popover. Lägger vi till kategorier eller historik så blir det mer.

**Marcus Nilsson** *15:01*
Heads-up: en av kunderna (Bistro Lyran) frågade också om möjligheten att skicka noteringar mellan personalen — typ "kan någon ta bord 7?". Det är en helt annan feature men nämner det här ifall någon tror det skulle gå att slå ihop. Jag tror inte det.

**Anna Lindqvist** *15:03*
Håller med, det är en chat-feature. Parkerar.

**Sofia Berg** *15:05*
👍 Skickar UI-skiss inom dagen.

---

## Sammanfattning av vad som *inte* är spikat

- Fritext vs. kategorier (eller hybrid)
- Direkt synlig vs. bakom klick (och hur mycket som syns direkt)
- Trunkeringsregel + tablet-layout
- Vem får skriva / radera (behörigheter)
- Vad triggar auto-rensning (bokningens status vs. bordets status vs. manuell)
- Hur edge case "någon rensar av misstag mitt i en allergi-måltid" hanteras
- Historik / audit log — uttryckligen *senare*
- Notifikation till annan personal — uttryckligen *en annan feature*
