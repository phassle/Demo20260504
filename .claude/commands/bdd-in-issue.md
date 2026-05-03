<!--
File path in your repo:
   .claude/commands/bdd-in-issue.md     (Claude Code)
or .github/prompts/bdd-in-issue.prompt  (GitHub Copilot prompt files)

Invocation:
   /bdd-in-issue 1247                  ← GitHub issue number
   /bdd-in-issue issues/03-ui-modal.md ← local Pocock-style issue file
-->

---
name: bdd-in-issue
description: Generate Given-When-Then scenarios for an issue and append
             them to the issue body, ready for the Copilot agent.
allowed-tools: Read, Bash(gh issue view *), Edit, Bash(gh issue edit *)
---

# bdd-in-issue

Read the issue body for `$ARGUMENTS`.

- If `$ARGUMENTS` is a number → fetch with `gh issue view $ARGUMENTS --json title,body`
- If `$ARGUMENTS` is a path → read the local file directly

Then:

1. **Identify the user-facing behaviour** the issue describes. If unclear, stop and list the missing pieces in an "Unresolved questions" section. Do not invent.

2. **Generate 3–5 BDD scenarios** in Gherkin, covering:
   - 1× happy path (the core behaviour)
   - 1–2× edge cases (empty input, validation failure, boundary)
   - 1× authorisation / stop-rule (the user-without-permission case, OR the AGENTS.md stop rule that protects this area)

3. **Use the project's domain vocabulary** — read `UBIQUITOUS_LANGUAGE.md` if it exists. Don't introduce synonyms.

4. **Append to the issue body** under a `## BDD scenarios` heading. Do not overwrite existing sections.
   - GitHub: `gh issue edit $ARGUMENTS --body-file -`
   - Local: append to the file

5. **End with `## Unresolved questions`** if there are any. Empty this section if none.

## Constraints

- Do **not** implement anything. Scenarios only.
- Keep each scenario ≤ 10 lines. If it's longer, it's two scenarios.
- Use the project's BDD framework conventions (SpecFlow / Cucumber / xUnit + Gherkin) — read `AGENTS.md` for the convention.
- One Feature per file. One Scenario per behaviour.

## Example output to append

```gherkin
## BDD scenarios

Feature: Split-even share mode

  Scenario: Manager splits a 4-person check evenly
    Given a check "1247" totalling 800 SEK with 4 diners
    When the cashier clicks "Split evenly"
    Then 4 share rows are created in split_shares
    And each share equals 200 SEK

  Scenario: Empty diner list rejects the split
    Given a check with 0 diners assigned
    When the cashier clicks "Split evenly"
    Then a validation error is shown
    And no share rows are created

  Scenario: Audit trail records who initiated the split
    Given I am logged in as cashier "alex"
    When I confirm a split-even on check "1247"
    Then split_shares rows are stamped with created_by = "alex"
```

---

## Source

Inspired by Matt Pocock's `to-issues` and `tdd` skills (mattpocock/skills, Apache-2.0)
combined with Carlos Granados' BDD-with-AI workflow.
Adapted for Caspeco's Jira ↔ GitHub Copilot agent flow.
