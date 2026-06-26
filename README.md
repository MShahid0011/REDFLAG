# Red Flag — Social Engineering Awareness Trainer

A self-contained multi-page website (HTML + CSS + JavaScript, no backend, no
install required) that trains users to spot phishing, smishing, vishing, and
other social engineering tactics. Built for a cybersecurity internship
project.

## How to run it

No installation needed.

1. Unzip this folder.
2. Double-click `index.html`.
3. It opens directly in your browser and works immediately.

That's it — no server, no terminal, no dependencies. Navigate between pages
using the navigation bar at the top.

## Pages

| Page | File | What it covers |
|---|---|---|
| Home | `index.html` | Landing page: hero, key stats, attack-type overview, process preview |
| About Us | `about.html` | Project purpose, the problem being addressed, design principles |
| How It Works | `how-it-works.html` | Detailed step-by-step walkthrough of the quiz flow |
| Live Threats | `threats.html` | Current phishing/social-engineering stats, trending tactics, and real recent headlines with source links |
| Quiz | `quiz.html` | The interactive trainer itself — 12 scenarios, scoring, red-flag highlighting |

All five pages share the same navigation bar (Home / About Us / How It
Works / Live Threats / Start Quiz), which collapses into a hamburger menu
on mobile.

## How the quiz works

- 12 realistic (fictional) scenarios across email, SMS, and phone-call
  transcripts
- You classify each as Legitimate or Social Engineering
- After answering, the exact red-flag phrases get highlighted directly in
  the message, with an explanation of why each one is suspicious
- A final debrief screen shows your score, a breakdown by attack type, and
  general tips for spotting social engineering in real life

## A note on the Live Threats page

The stats and headlines on threats.html were gathered via web research
and reflect a snapshot taken on June 23, 2026, with citations/links to
original sources (The Hacker News, BleepingComputer, DataBreachToday, Check
Point Research, Google's Safety & Security blog, SWK Technologies, and
others). This is a manually curated snapshot, not a live, auto-updating
feed — if you present this project later, consider re-checking the sources
listed at the bottom of that page for anything more recent.

## Project structure

se-quiz/
├── index.html              -> Home page
├── about.html              -> About Us page
├── how-it-works.html       -> How It Works page
├── threats.html            -> Live Threats page
├── quiz.html               -> The interactive quiz (main feature)
├── static/
│   ├── css/
│   │   └── style.css       -> All styling for every page
│   └── js/
│       ├── nav.js               -> Shared nav bar behavior (active link, mobile toggle)
│       ├── script.js            -> Quiz logic (flow, scoring, highlighting)
│       └── scenarios-data.js    -> Scenario content, loaded as a JS variable
└── data/
    └── scenarios.json      -> Same scenario content in plain JSON (reference copy)

## Editing the scenarios

The quiz loads scenario content from static/js/scenarios-data.js (a JS file
containing `const SCENARIOS_DATA = [...]`). This is intentional: browsers
block plain JSON file loading (fetch()) when a page is opened directly via
double-click instead of through a server, so the same data is embedded
directly as JavaScript instead. This keeps the app fully double-click-able
with zero setup.

data/scenarios.json contains the identical content in plain JSON, kept as a
clean, easy-to-read reference if you want to draft new scenarios there first.

To add or edit a scenario, edit the array inside static/js/scenarios-data.js.
Each entry looks like:

{
  "id": "s01",
  "type": "email",
  "difficulty": "easy",
  "isPhishing": true,
  "sender": "IT-Support@secure-paypa1.com",
  "subject": "Urgent: Your account will be suspended in 24 hours",
  "content": "Dear Customer ... ",
  "redFlags": [
    {
      "tag": "spoofed_domain",
      "snippet": "secure-paypa1.com",
      "note": "Domain uses a '1' instead of 'l' - a classic lookalike domain trick."
    }
  ],
  "explanation": "This is a classic credential-phishing email ..."
}

The snippet text in each red flag must match the text exactly as it appears
in content or sender, so the app can find and highlight it.

## Notes for your internship report

This project is a self-contained simulator: it does not send real
emails/SMS, store personal data, or contact real users. It's intended
purely as an educational security-awareness training tool, and runs
entirely client-side in the browser.
