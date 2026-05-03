# caspeco-fe-demo

A demo POS for restaurants. Mocked data, no backend, no auth. The shopping surface that an agent works in is the open POS order draft — there is no concept of physical tables in this demo.

## Language

**Order**:
A draft of items being assembled at the till before payment. Held entirely in client state.
_Avoid_: Cart, basket, ticket, check

**Order Item**:
A single product row inside an Order. See `caspeco-fe-demo/src/components/pos/OrderPanel.tsx:5-9`.
_Avoid_: Line, line item

**Order Note** *(new)*:
A free-text annotation attached to the currently-open Order. Cleared when the Order is paid or reset.
_Avoid_: Bordsnotering (see Flagged ambiguities), comment, memo, label

**Dine-in / Take-away**:
A boolean toggle on the Order that sets fulfilment mode. There is no follow-on workflow tied to this — it's display state only.

**Pay**:
Terminal state of an Order. Triggers `onPay` (`OrderPanel.tsx:32-39`), which resets the draft. There is no payment-processing layer.

## Relationships

- An **Order** has zero or many **Order Items**.
- An **Order** has zero or one **Order Note**.
- **Pay** ends the lifecycle of an **Order** (and its **Order Note**).

## Example dialogue

> **Dev:** "When the cashier presses Pay, what happens to the **Order Note**?"
> **Domain expert:** "Same as the items — gone. The next **Order** starts blank. Notes are situational, not historical."

## Flagged ambiguities

- **"Bordsnotering" vs "Order Note"** — The originating slack thread (`slack-thread.md`) frames the feature as a *table* note tied to a floor plan and a `booking.status` lifecycle. Neither tables nor individual bookings exist in this demo. Resolved: the feature is implemented as an **Order Note** on the POS order draft. The "vänd bord"-question collapses into the natural Order lifecycle (Pay = end). The permissions question collapses into N/A (demo has no auth). Anything that genuinely needs a *table* abstraction is out of scope and tracked separately if surfaced.
