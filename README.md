# Summit Updates (prototype)

A first-version prototype for **Scenario 2: Important Employee Updates**, built for Summit Retail Group (5 stores, ~200 employees). Built with Claude as the AI coding tool. The styling follows the MangoApps palette (deep green, green actions, orange accent).

## Run it
No install and no build step. Open `index.html` in any modern browser.
Or run `python3 -m http.server` in this folder and visit http://localhost:8000.

The app uses mock data (40 employees across 5 stores, 5 sample updates) saved in your browser's localStorage. Use **Reset demo data** in the footer to start over. The **View as** buttons at the top switch between Employee, Store manager (Rachel) and Ops manager (Michael). For employees, a dropdown picks the person.

**Best on a phone-width window.** The employee view is mobile-first, so shrink your browser or use dev tools device mode.

## Who it's for
- **Alex, sales associate:** a phone-first feed that asks him to act only when something really matters.
- **Rachel, store manager:** proof that important updates were seen, and exactly who hasn't.
- **Michael, operations manager:** posts to one or many stores and sees confirmation across all of them.

## What I built (one workflow, end to end)
**Post → employee sees it → one tap to confirm → manager sees who's missing → remind.**

**Employee**
- **To do** shows only what needs confirmation (soonest first), plus anything new. When nothing is pending it says "You're all caught up".
- **All updates** is the full history.
- Confirming is one small button in the feed. It turns into "✓ Confirmed", with an Undo link, and the card then leaves the To do list. No popups.
- FYI updates are quiet. "Read more" marks them read, and they stay put until you leave the tab.

**Manager**
- The dashboard opens on **Needs follow-up** and shows the confirmation rate, overdue flags and a per-store breakdown.
- **See people** has Not confirmed and Confirmed tabs, a name search, and each person's status ("Hasn't opened it" or "Opened, not confirmed").
- **Remind** works for one person or for everyone still outstanding.

**Posting an update**
- Title, message, store chips, a plain-language "Ask employees to confirm" switch, and one-tap deadline chips.
- A live preview shows exactly what employees will see.
- The button shows the audience size, e.g. "Post to 8 employees".

## The key design decision: Rachel vs. Alex
They want opposite things, so **confirmation is opt-in per update**. By default an update is an FYI with no prompt. Only updates a manager marks important show up in To do, and confirming takes one tap. There are no popups, no repeating prompts, and no push spam. The only nudge is a reminder a manager sends deliberately, and it appears on the card the next time the employee opens the app.

## Assumptions
- Store managers post only to their own store. Ops can post to any or all stores.
- "Important" is chosen by the manager, not detected automatically.
- Confirming means "I've read this", not "I agree".
- Each employee belongs to one store.
- Reminders are simulated (a label on the card), not real notifications.
- Opening an FYI counts as read. Important updates need the explicit tap.
- "Phones" means a mobile web view, not a native app.

## Testing
I tested beyond the happy path, both by hand and with an automated headless test (22 checks):

```
npm i jsdom && node smoke.js
```

It covers:
- the confirm, undo and badge flow
- an FYI staying visible after "Read more"
- a manager seeing a confirmation immediately
- store-manager scoping
- validation: blank title, blank message, no store
- HTML in text being escaped
- audience size on the post button
- an update reaching only the targeted store
- remind-all and the reminder banner
- the all-caught-up state
- reset

I also found and fixed one bug during review: opening an FYI update used to make it vanish from To do, which looked like a task disappearing.

## Left out, and what I'd ask next
- **Questions and feedback on updates** (Michael's "eventually"). Moderated or open? Who answers?
- **Real notifications (push or SMS).** Do floor staff have work phones, or is text the real channel?
- **Editing or deleting a posted update.** Should a material edit reset confirmations?
- **Audit export.** Do safety updates need a compliance record?
- **Finer targeting** by role, shift or department, and employees who work at more than one store.
- **Real login, a backend and a native app.**
