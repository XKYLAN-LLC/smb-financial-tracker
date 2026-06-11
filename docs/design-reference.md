# Design Reference

The dashboard direction is anchored on the Creava personal-finance dashboard pattern from Dribbble: a clean SaaS finance workspace with a narrow icon rail, top pill navigation, a large balance card, activity and income-stream cards, a financial assistant panel, goal/credit metrics, and recent transaction rows.

Reference family:

- Dribbble finance dashboard search: <https://dribbble.com/search/finance%20dashboard>
- Personal Finance Dashboard by Creava: <https://dribbble.com/shots/27168829-Personal-Finance-Dashboard>

## What The UI Borrows

- A contained white app canvas over a cool gray page background.
- A narrow icon rail plus top pill navigation instead of a text-heavy sidebar.
- A first-screen finance board with balance, activity, income streams, assistant, goals, threshold, overview, and recent-transaction cards.
- Purple, mint, blue, and dark primary accents based on the reference palette.
- A local generated-style assistant orb asset for the assistant panel instead of copied reference artwork.
- Softer card shadows, less table chrome in the first viewport, and stronger visual hierarchy than a utility spreadsheet.

## Intentional Differences

- The app does not copy Dribbble artwork, fake banking data, card imagery, or exact pixel layouts.
- The dashboard keeps local-first privacy, review statuses, source evidence, and accountant exports visible because those are the project workflow.
- Charts remain lightweight and traceable. The repo should not imply live bank connections, portfolio sync, or automated tax advice.
- The mobile layout favors usable controls and readable ledger access over recreating a desktop composition at phone width.
