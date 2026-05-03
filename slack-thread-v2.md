# Slack-tråd: "Slut just nu"-markering på produkter (POS)

**Kanal:** `#produkt-caspeco-fe`
**Datum:** 2026-05-09
**Deltagare:** Anna Lindqvist (PM), Erik Dahlberg (Tech Lead), Sofia Berg (UX), Marcus Nilsson (CS), Lina Holm (kund — Restaurang Stensjö)

---

**Anna Lindqvist** *09:14*
Andra tråden den här veckan 👋. Lina + två andra kunder rapporterade samma sak igår: serveringspersonalen tog emot beställningar på rätter som var slut, realiserade det först när köket sa *"nej det har vi inte"*, och fick gå tillbaka till gästen och be om ursäkt. Halva poängen med en POS är väl att den ska *veta*. Skissar på en "slut just nu"-markering på produkter — knapp för servitören → produkten greyas ut i ProductGrid. Tankar?

**Lina Holm** *09:16*
Vi har det här hela tiden. Speciellt fredagskvällar när populära rätter tar slut. Köket meddelar baren via en WhatsApp-grupp ibland och servitörerna får informationen en halvtimme senare. Har hänt att vi sålt fyra portioner av samma rätt efter att den var slut.

**Erik Dahlberg** *09:22*
Lättaste tekniska skissen: lägg till `available: boolean` på `Product`, default `true`. ProductGrid renderar greyed-out + "Slut"-badge när `false`. Hur sätter man den `false`? En "..."-meny på produktkortet med *"Markera som slut just nu"*?

**Sofia Berg** *09:25*
Tänk igenom innan vi spikar UI:t:
1. Vem får markera — vem som helst eller bara hovmästare/manager?
2. Hur länge gäller markeringen? Resten av passet? Hela dagen? Tills nästa morgon?
3. Återställning — manuell toggle eller auto-reset vid något event?
4. Vad händer om servitören klickar på en markerad produkt ändå? Helt disablad eller varning ("vill du ändå sälja?")?
5. Påverkar det sökningen i `SearchField`?

**Marcus Nilsson** *09:31*
Från support-ärenden ser jag två tydliga mönster:
(a) *"vissa produkter är slut idag"* — auto-reset nästa morgon
(b) *"den här produkten har vi inte just nu (10–15 min)"* — kort-livad, kommer tillbaka inom passet
Cirka 90 % av fallen är (a) tror jag.

**Anna Lindqvist** *09:34*
Min instinkt: gäller för dagen, auto-reset vid midnatt eller vid nästa morgonpasses start. Manuell undo om servitören klickade fel eller om en ny leverans kommer in mitt i passet.

**Lina Holm** *09:38*
Funkar för oss. Men kan en produkt **bli tillgänglig igen mitt under passet** utan att man måste vänta till imorgon? Vi har scenariot — t.ex. en leverans kommer 17:30 och då vill vi inte sälja under "slut" till midnatt.

**Erik Dahlberg** *09:41*
Då måste vi avgöra två frågor som hänger ihop:
- **Lagring**: lokal state per session (försvinner vid refresh) eller persisteras nånstans?
- **Synk mellan terminaler**: om lokalen har två kassor — ska "slut" på terminal 1 reflekteras på terminal 2 direkt?
Helt olika storlek på arbetet.

**Sofia Berg** *09:44*
Och visuellt — bara `opacity: 0.4` + en liten badge är minimalistiskt men det är lätt att glömma bort vad som markerats. Vi kanske vill ha en räknare i headern (*"5 slut just nu"*) eller en mini-lista? Eller ingenting?

**Marcus Nilsson** *09:48*
En kund (Bistro Lyran) frågade också om man kan markera en hel **kategori** som slut — t.ex. *"vi har inga sushi-rätter alls just nu"*. Skulle ge ett ✗ på CategoryPills. Tror per-produkt räcker för v1, men nämner det.

**Anna Lindqvist** *09:52*
Håller med, kategori-flag är v2.

OK frågor jag tar med mig:
- Behörighet för markering
- Lagrings-modell (lokal vs. delad)
- Auto-reset-trigger
- Klick på markerad produkt — disable eller varning?
- Sökning — gömma eller visa med badge?
- UI för översikt (räknare? lista? inget?)
- Hur återställer man manuellt?

Erik, kan du sikta på början av nästa vecka? Är osäker på hur stor diskussionen om persistens blir.

**Erik Dahlberg** *09:55*
Beror helt på vad ni svarar på persistens-frågan. Rent lokal-state = 1–2 timmar. Delat mellan terminaler = ny endpoint + sync-mekanism. Faktor 5x i scope.

**Sofia Berg** *09:58*
Skickar wireframe på greyed-out-tillståndet och en variant med räknare i headern. Också en med litet "✓ Tillbaka i sortimentet"-affordans när man av-markerar.

**Anna Lindqvist** *10:02*
👍 Drar ihop till en grilling-session. Lägger PRD-utkast i kommentarerna när jag har en första version.

---

## Sammanfattning av öppna frågor

- **Behörighet** — alla servitörer eller bara manager-rollen?
- **Lagrings-modell** — lokal page-state eller delad mellan terminaler?
- **Auto-reset-trigger** — midnatt? skiftslut? "x timmar efter markering"? aldrig (manuell-only)?
- **Klick på markerad produkt** — disable helt eller varningsdialog?
- **Sökning** — gömma slutmarkerade eller visa dem med badge i resultaten?
- **Översikts-UI** — räknare i headern, separat lista, eller ingenting alls?
- **Manuell återställning** — inline toggle på produkten eller en management-vy?
- **Kategori-markering** — uttryckligen utanför scope (v2).
- **Tillbaka-i-sortimentet-flow** — separata UI-states för "markera slut" vs "markera tillbaka", eller samma toggle?
