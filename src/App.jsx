import { useState, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────
   WCAG AUDIT TOOL
   Uses axe-core rules mapped to WCAG criteria.
   Analyses pasted HTML and shows violations
   grouped by level (A / AA / AAA).
───────────────────────────────────────────── */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&family=Lato:wght@300;400;700&display=swap');

:root {
  --bg: #0b0f1a;
  --surface: #111827;
  --surface2: #1c2333;
  --border: #2a3448;
  --text: #e8eaf0;
  --muted: #6b7a99;
  --accent: #00e5b4;
  --accent2: #3b82f6;
  --err: #f87171;
  --warn: #fbbf24;
  --ok: #34d399;
  --aaa: #a78bfa;
  --aa: #60a5fa;
  --a: #f97316;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.skip-link {
  position: absolute; top: -100%; left: 1rem;
  background: var(--accent); color: #000;
  padding: 0.6rem 1.2rem; border-radius: 0 0 8px 8px;
  font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.9rem;
  text-decoration: none; z-index: 9999; transition: top 0.2s;
}
.skip-link:focus { top: 0; outline: 3px solid #fff; outline-offset: 2px; }

.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}

body {
  font-family: 'Lato', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}

.app {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
}

/* Header */
.header {
  margin-bottom: 3rem;
  position: relative;
}
.header::before {
  content: '';
  position: absolute;
  top: -2.5rem; left: -1.5rem; right: -1.5rem;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent2), var(--aaa));
}
.header-top {
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: 1rem;
  flex-wrap: wrap;
}
.logo {
  font-family: 'Syne', sans-serif;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
}
.logo span { color: var(--muted); }
h1 {
  font-family: 'Syne', sans-serif;
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 800;
  line-height: 1.05;
  margin-top: 0.75rem;
  letter-spacing: -0.02em;
}
h1 em { font-style: normal; color: var(--accent); }
.subtitle {
  font-size: 1rem; color: var(--muted);
  margin-top: 0.75rem; max-width: 520px; line-height: 1.6;
}

.level-pills { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1.25rem; }
.pill {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.72rem; font-weight: 500;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  border: 1px solid;
  letter-spacing: 0.06em;
}
.pill-a   { color: var(--a);   border-color: var(--a);   background: rgba(249,115,22,.08); }
.pill-aa  { color: var(--aa);  border-color: var(--aa);  background: rgba(96,165,250,.08); }
.pill-aaa { color: var(--aaa); border-color: var(--aaa); background: rgba(167,139,250,.08); }

/* Input area */
.input-section { margin-bottom: 2rem; }
.input-label {
  display: block;
  font-family: 'Syne', sans-serif;
  font-size: 0.8rem; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--muted); margin-bottom: 0.6rem;
}
.textarea-wrap { position: relative; }
textarea {
  width: 100%;
  min-height: 180px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.82rem;
  line-height: 1.65;
  padding: 1.1rem 1.25rem;
  resize: vertical;
  transition: border-color 0.15s, box-shadow 0.15s;
}
textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(0,229,180,0.15);
}
textarea::placeholder { color: var(--muted); }

.btn-row { display: flex; gap: 0.75rem; margin-top: 1rem; flex-wrap: wrap; }

.btn-primary {
  background: var(--accent);
  color: #000;
  border: none;
  border-radius: 8px;
  font-family: 'Syne', sans-serif;
  font-size: 0.9rem; font-weight: 700;
  padding: 0.75rem 1.75rem;
  cursor: pointer;
  display: flex; align-items: center; gap: 0.5rem;
  letter-spacing: 0.04em;
  transition: opacity 0.15s, transform 0.1s;
}
.btn-primary:hover { opacity: 0.88; }
.btn-primary:active { transform: scale(0.98); }
.btn-primary:focus { outline: 3px solid #fff; outline-offset: 2px; }
.btn-primary:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

.btn-secondary {
  background: transparent;
  color: var(--muted);
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-family: 'Syne', sans-serif;
  font-size: 0.85rem; font-weight: 600;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  letter-spacing: 0.04em;
  transition: border-color 0.15s, color 0.15s;
}
.btn-secondary:hover { border-color: var(--muted); color: var(--text); }
.btn-secondary:focus { outline: 3px solid var(--accent); outline-offset: 2px; }

.sample-btns { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; margin-top: 0.75rem; }
.sample-label { font-size: 0.78rem; color: var(--muted); }
.btn-sample {
  background: var(--surface2);
  color: var(--accent2);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem;
  padding: 0.3rem 0.7rem;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-sample:hover { background: var(--border); }
.btn-sample:focus { outline: 3px solid var(--accent); outline-offset: 2px; }

/* Scanning animation */
.scanning {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 1.25rem;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.85rem;
  color: var(--accent);
  margin-bottom: 1.5rem;
}
.scan-dot {
  width: 10px; height: 10px;
  background: var(--accent);
  border-radius: 50%;
  animation: pulse 1s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }

/* Score card */
.score-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}
.score-card {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 1.25rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.score-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
}
.score-card.total::before { background: var(--accent); }
.score-card.level-a::before { background: var(--a); }
.score-card.level-aa::before { background: var(--aa); }
.score-card.level-aaa::before { background: var(--aaa); }
.score-card.passed::before { background: var(--ok); }

.score-num {
  font-family: 'Syne', sans-serif;
  font-size: 2.4rem; font-weight: 800;
  line-height: 1;
  margin-bottom: 0.25rem;
}
.score-card.total .score-num { color: var(--err); }
.score-card.level-a .score-num { color: var(--a); }
.score-card.level-aa .score-num { color: var(--aa); }
.score-card.level-aaa .score-num { color: var(--aaa); }
.score-card.passed .score-num { color: var(--ok); }
.score-label { font-size: 0.78rem; color: var(--muted); letter-spacing: 0.05em; }

/* Overall score ring */
.score-ring-wrap {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem 2rem;
  display: flex; align-items: center; gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}
.ring-svg { width: 90px; height: 90px; flex-shrink: 0; }
.ring-bg { fill: none; stroke: var(--surface2); stroke-width: 8; }
.ring-fill { fill: none; stroke-width: 8; stroke-linecap: round; transform: rotate(-90deg); transform-origin: 50% 50%; transition: stroke-dashoffset 0.8s ease; }
.ring-score { font-family: 'Syne', sans-serif; font-size: 1.3rem; font-weight: 800; fill: var(--text); text-anchor: middle; dominant-baseline: middle; }
.ring-info h2 { font-family: 'Syne', sans-serif; font-size: 1.3rem; font-weight: 700; margin-bottom: 0.3rem; }
.ring-info p { font-size: 0.88rem; color: var(--muted); line-height: 1.5; max-width: 380px; }

/* Filters */
.filters {
  display: flex; gap: 0.5rem; flex-wrap: wrap;
  margin-bottom: 1.5rem; align-items: center;
}
.filter-label { font-size: 0.78rem; color: var(--muted); margin-right: 0.25rem; }
.filter-btn {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 6px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.75rem; font-weight: 500;
  padding: 0.35rem 0.75rem;
  cursor: pointer;
  color: var(--muted);
  transition: all 0.15s;
  letter-spacing: 0.04em;
}
.filter-btn:hover { border-color: var(--muted); color: var(--text); }
.filter-btn:focus { outline: 3px solid var(--accent); outline-offset: 2px; }
.filter-btn.active { color: #000; border-color: transparent; }
.filter-btn.active.all  { background: var(--accent); color: #000; }
.filter-btn.active.a    { background: var(--a); }
.filter-btn.active.aa   { background: var(--aa); }
.filter-btn.active.aaa  { background: var(--aaa); }

/* Results */
.results-section h2 {
  font-family: 'Syne', sans-serif;
  font-size: 1rem; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--muted); margin-bottom: 1rem;
}

.violation-card {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  margin-bottom: 1rem;
  overflow: hidden;
  transition: border-color 0.15s;
}
.violation-card:hover { border-color: var(--muted); }

.violation-header {
  width: 100%; display: flex; align-items: flex-start; gap: 1rem;
  padding: 1.1rem 1.25rem;
  background: none; border: none; cursor: pointer;
  text-align: left; color: var(--text);
  transition: background 0.15s;
}
.violation-header:hover { background: var(--surface2); }
.violation-header:focus { outline: 3px solid var(--accent); outline-offset: -2px; }

.v-level-badge {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.68rem; font-weight: 500;
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  flex-shrink: 0;
  margin-top: 2px;
  letter-spacing: 0.06em;
}
.badge-a   { background: rgba(249,115,22,.15); color: var(--a); }
.badge-aa  { background: rgba(96,165,250,.15);  color: var(--aa); }
.badge-aaa { background: rgba(167,139,250,.15); color: var(--aaa); }

.v-title-wrap { flex: 1; min-width: 0; }
.v-title {
  font-family: 'Syne', sans-serif;
  font-size: 0.95rem; font-weight: 700;
  line-height: 1.3; margin-bottom: 0.2rem;
}
.v-criterion {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.72rem; color: var(--muted);
}
.v-count {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.78rem; color: var(--muted);
  flex-shrink: 0; margin-top: 2px;
}
.v-chevron {
  flex-shrink: 0; transition: transform 0.2s; margin-top: 3px;
  color: var(--muted);
}
.v-chevron.open { transform: rotate(180deg); }

.violation-body { padding: 0 1.25rem 1.25rem; border-top: 1px solid var(--border); }
.violation-body p { font-size: 0.88rem; color: var(--muted); margin: 0.85rem 0 0.6rem; line-height: 1.6; }

.impact-tag {
  display: inline-block;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem; padding: 0.2rem 0.6rem;
  border-radius: 4px; margin-bottom: 0.75rem;
  font-weight: 500; letter-spacing: 0.04em;
}
.impact-critical { background: rgba(248,113,113,.15); color: var(--err); }
.impact-serious  { background: rgba(251,191,36,.15);  color: var(--warn); }
.impact-moderate { background: rgba(96,165,250,.15);  color: var(--aa); }
.impact-minor    { background: rgba(107,122,153,.15); color: var(--muted); }

.fix-label {
  font-family: 'Syne', sans-serif;
  font-size: 0.72rem; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--accent); margin-bottom: 0.4rem;
}
.fix-box {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.8rem;
  color: var(--text);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.wcag-ref {
  display: inline-flex; align-items: center; gap: 0.3rem;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.72rem; color: var(--accent2);
  text-decoration: none; margin-top: 0.6rem;
  padding: 0.2rem 0;
  border-bottom: 1px solid transparent;
  transition: border-color 0.15s;
}
.wcag-ref:hover { border-color: var(--accent2); }
.wcag-ref:focus { outline: 3px solid var(--accent); outline-offset: 2px; border-radius: 2px; }

/* Pass state */
.all-pass {
  text-align: center; padding: 3rem 2rem;
  background: var(--surface);
  border: 1.5px solid var(--ok);
  border-radius: 12px;
}
.pass-icon {
  width: 60px; height: 60px;
  background: var(--ok);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1rem;
}
.all-pass h3 { font-family: 'Syne', sans-serif; font-size: 1.4rem; font-weight: 800; color: var(--ok); }
.all-pass p { color: var(--muted); font-size: 0.9rem; margin-top: 0.5rem; }

/* Empty state */
.empty-state {
  text-align: center; padding: 4rem 2rem;
  border: 1.5px dashed var(--border);
  border-radius: 12px;
  color: var(--muted);
}
.empty-state svg { width: 48px; height: 48px; margin: 0 auto 1rem; display: block; opacity: 0.4; }
.empty-state h3 { font-family: 'Syne', sans-serif; font-size: 1.1rem; color: var(--text); margin-bottom: 0.4rem; }
.empty-state p { font-size: 0.88rem; line-height: 1.6; }

@media (max-width: 600px) {
  .score-ring-wrap { flex-direction: column; }
  .score-grid { grid-template-columns: 1fr 1fr; }
}
`;

/* ── WCAG Rule Database ── */
const RULES = [
  {
    id: "img-alt",
    title: "Images must have alternative text",
    criterion: "1.1.1",
    level: "A",
    impact: "critical",
    description: "All <img> elements must have an alt attribute. Screen readers announce images — without alt text, users who are blind have no idea what the image conveys.",
    fix: `<!-- Wrong -->
<img src="logo.png">

<!-- Correct -->
<img src="logo.png" alt="EnabledTalent logo">

<!-- Decorative image -->
<img src="divider.png" alt="">`,
    wcagUrl: "https://www.w3.org/WAI/WCAG21/Understanding/non-text-content",
    check: (html) => {
      const imgs = [...html.matchAll(/<img[^>]*>/gi)];
      const violations = imgs.filter(m => !/alt\s*=/i.test(m[0]));
      return violations.length;
    },
  },
  {
    id: "label",
    title: "Form inputs must have associated labels",
    criterion: "1.3.1",
    level: "A",
    impact: "critical",
    description: "Every <input>, <select>, and <textarea> needs a <label> element linked via htmlFor/id, or an aria-label. Without it, screen reader users cannot identify form fields.",
    fix: `<!-- Wrong -->
<input type="text" placeholder="Name">

<!-- Correct -->
<label for="name">Full name</label>
<input type="text" id="name">

<!-- Or with aria-label -->
<input type="search" aria-label="Search jobs">`,
    wcagUrl: "https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships",
    check: (html) => {
      const inputs = [...html.matchAll(/<input(?![^>]*type=["'](?:hidden|submit|button|image|reset)["'])[^>]*>/gi)];
      return inputs.filter(m => !/aria-label|aria-labelledby/i.test(m[0]) && !/id=["'][^"']+["']/i.test(m[0])).length;
    },
  },
  {
    id: "heading-order",
    title: "Headings must not skip levels",
    criterion: "1.3.1",
    level: "A",
    impact: "moderate",
    description: "Heading levels (h1–h6) must be nested properly. Jumping from h1 to h3 confuses screen reader users who use headings to navigate page structure.",
    fix: `<!-- Wrong -->
<h1>Page Title</h1>
<h3>Section</h3>  <!-- skipped h2! -->

<!-- Correct -->
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>`,
    wcagUrl: "https://www.w3.org/WAI/WCAG21/Techniques/general/G141",
    check: (html) => {
      const headings = [...html.matchAll(/<h([1-6])[^>]*>/gi)].map(m => parseInt(m[1]));
      let skips = 0;
      for (let i = 1; i < headings.length; i++) {
        if (headings[i] - headings[i - 1] > 1) skips++;
      }
      return skips;
    },
  },
  {
    id: "lang",
    title: "Page must have a lang attribute",
    criterion: "3.1.1",
    level: "A",
    impact: "serious",
    description: "The <html> element must have a lang attribute. Screen readers use this to choose the correct language engine for pronunciation.",
    fix: `<!-- Wrong -->
<html>

<!-- Correct -->
<html lang="en">

<!-- French Canadian -->
<html lang="fr-CA">`,
    wcagUrl: "https://www.w3.org/WAI/WCAG21/Understanding/language-of-page",
    check: (html) => (/<html[^>]*>/i.test(html) && !/lang\s*=/i.test(html.match(/<html[^>]*>/i)?.[0] || "")) ? 1 : 0,
  },
  {
    id: "button-name",
    title: "Buttons must have discernible text",
    criterion: "4.1.2",
    level: "A",
    impact: "critical",
    description: "Every <button> needs visible text or an aria-label. Icon-only buttons are invisible to screen readers without an accessible name.",
    fix: `<!-- Wrong -->
<button><svg>...</svg></button>

<!-- Correct -->
<button aria-label="Close menu">
  <svg aria-hidden="true">...</svg>
</button>

<!-- Or with visible text -->
<button>Submit application</button>`,
    wcagUrl: "https://www.w3.org/WAI/WCAG21/Understanding/name-role-value",
    check: (html) => {
      const btns = [...html.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/gi)];
      return btns.filter(m => {
        const hasAriaLabel = /aria-label\s*=/i.test(m[0]);
        const hasText = m[1].replace(/<[^>]+>/g, "").trim().length > 0;
        return !hasAriaLabel && !hasText;
      }).length;
    },
  },
  {
    id: "link-name",
    title: "Links must have descriptive text",
    criterion: "2.4.4",
    level: "A",
    impact: "serious",
    description: 'Links like "click here" or "read more" are meaningless out of context. Screen reader users often browse links in a list — each link must describe its destination.',
    fix: `<!-- Wrong -->
<a href="/jobs">Click here</a>
<a href="/about">Read more</a>

<!-- Correct -->
<a href="/jobs">Browse open positions</a>
<a href="/about">Learn more about EnabledTalent</a>

<!-- Or with aria-label -->
<a href="/jobs" aria-label="Browse all open positions">
  Read more
</a>`,
    wcagUrl: "https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context",
    check: (html) => {
      const links = [...html.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)];
      const vague = ["click here","read more","here","more","link","this","learn more"];
      return links.filter(m => vague.includes(m[1].replace(/<[^>]+>/g,"").trim().toLowerCase())).length;
    },
  },
  {
    id: "aria-required",
    title: "Required fields must be marked",
    criterion: "3.3.2",
    level: "A",
    impact: "moderate",
    description: "Required form fields must use aria-required='true' or the required attribute so screen readers can announce the requirement before the user submits.",
    fix: `<!-- Wrong -->
<input type="email" placeholder="Email *">

<!-- Correct -->
<label for="email">
  Email <span aria-hidden="true">*</span>
  <span class="sr-only">(required)</span>
</label>
<input type="email" id="email" aria-required="true">`,
    wcagUrl: "https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions",
    check: (html) => {
      const inputs = [...html.matchAll(/<input[^>]*type=["'](?:text|email|tel|password|number)["'][^>]*>/gi)];
      return inputs.filter(m => /\*|required/i.test(m[0]) && !/aria-required/i.test(m[0])).length;
    },
  },
  {
    id: "focus-visible",
    title: "Focus indicator must not be suppressed",
    criterion: "2.4.7",
    level: "AA",
    impact: "serious",
    description: "CSS that removes focus outlines (outline: none / outline: 0) without providing an alternative makes the page unusable for keyboard-only users.",
    fix: `/* Wrong */
:focus { outline: none; }
button:focus { outline: 0; }

/* Correct — custom focus style */
:focus-visible {
  outline: 3px solid #1a6fc4;
  outline-offset: 2px;
  border-radius: 2px;
}`,
    wcagUrl: "https://www.w3.org/WAI/WCAG21/Understanding/focus-visible",
    check: (html) => (/(outline\s*:\s*none|outline\s*:\s*0)/i.test(html) ? 1 : 0),
  },
  {
    id: "color-contrast",
    title: "Text must meet colour contrast ratio",
    criterion: "1.4.3",
    level: "AA",
    impact: "serious",
    description: "Normal text needs a 4.5:1 contrast ratio; large text needs 3:1. Low contrast text is unreadable for users with low vision or colour blindness.",
    fix: `/* Wrong — light grey on white */
color: #aaaaaa; /* ~2.3:1 ratio */

/* Correct */
color: #595959; /* 7:1 ratio — meets AAA */
color: #767676; /* 4.5:1 ratio — meets AA */

/* Test with: */
/* WebAIM Contrast Checker: webaim.org/resources/contrastchecker */`,
    wcagUrl: "https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum",
    check: (html) => {
      const lowContrast = [...html.matchAll(/color\s*:\s*(#(?:aaa|bbb|ccc|ddd|eee|999|888|777)[^;]*|rgba?\([^)]*0\.[1-3][^)]*\))/gi)];
      return lowContrast.length;
    },
  },
  {
    id: "skip-link",
    title: "Page must have a skip navigation link",
    criterion: "2.4.1",
    level: "AA",
    impact: "moderate",
    description: "A 'skip to main content' link at the top of the page lets keyboard users bypass repeated navigation on every page load. Without it, they must tab through all nav items every time.",
    fix: `<!-- Add as first element in <body> -->
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<!-- CSS — visible on focus only -->
<style>
.skip-link {
  position: absolute;
  top: -100%;
  left: 1rem;
}
.skip-link:focus { top: 0; }
</style>

<!-- Target -->
<main id="main-content">...</main>`,
    wcagUrl: "https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks",
    check: (html) => (/skip.*main|skip.*content|skip.*nav/i.test(html) ? 0 : (/<nav|<header/i.test(html) ? 1 : 0)),
  },
  {
    id: "error-suggestion",
    title: "Form errors must include suggestions",
    criterion: "3.3.3",
    level: "AA",
    impact: "moderate",
    description: "When a form field has an error, the message must not just say 'invalid' — it should describe what is wrong and how to fix it.",
    fix: `<!-- Wrong -->
<span class="error">Invalid input</span>
<span class="error">Error</span>

<!-- Correct -->
<span class="error" role="alert">
  Please enter a valid email address, e.g. name@example.com
</span>`,
    wcagUrl: "https://www.w3.org/WAI/WCAG21/Understanding/error-suggestion",
    check: (html) => {
      const errors = [...html.matchAll(/class=["'][^"']*error[^"']*["'][^>]*>([\s\S]*?)<\//gi)];
      return errors.filter(m => {
        const text = m[1].replace(/<[^>]+>/g,"").trim().toLowerCase();
        return ["invalid","error","wrong","incorrect","required"].includes(text) || text.length < 8;
      }).length;
    },
  },
  {
    id: "table-headers",
    title: "Tables must have header cells",
    criterion: "1.3.1",
    level: "A",
    impact: "serious",
    description: "Data tables must use <th> elements with scope attributes so screen readers can associate each cell with its row and column headers.",
    fix: `<!-- Wrong -->
<table>
  <tr><td>Name</td><td>Role</td></tr>
  <tr><td>Sneha</td><td>Developer</td></tr>
</table>

<!-- Correct -->
<table>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Role</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Sneha</td><td>Developer</td>
    </tr>
  </tbody>
</table>`,
    wcagUrl: "https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships",
    check: (html) => {
      const tables = [...html.matchAll(/<table[\s\S]*?<\/table>/gi)];
      return tables.filter(m => !/<th/i.test(m[0])).length;
    },
  },
  {
    id: "contrast-enhanced",
    title: "Text must meet enhanced contrast ratio (7:1)",
    criterion: "1.4.6",
    level: "AAA",
    impact: "moderate",
    description: "AAA level requires a 7:1 contrast ratio for normal text (vs 4.5:1 for AA). This benefits users with severe low vision and colour blindness.",
    fix: `/* AA minimum (4.5:1) */
color: #767676; /* on white */

/* AAA enhanced (7:1) — recommended */
color: #595959; /* on white */
color: #1a1a2e; /* near-black on white */

/* Use a contrast checker to verify: */
/* webaim.org/resources/contrastchecker */`,
    wcagUrl: "https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced",
    check: (html) => {
      const midGrey = [...html.matchAll(/color\s*:\s*(#(?:[6-9a-f][0-9a-f]{5}|[6-9a-f]{3})\b)/gi)];
      return midGrey.length > 0 ? 1 : 0;
    },
  },
  {
    id: "reduced-motion",
    title: "Animations must respect prefers-reduced-motion",
    criterion: "2.3.3",
    level: "AAA",
    impact: "moderate",
    description: "Users with vestibular disorders can experience nausea or seizures from animations. All CSS animations should be wrapped in a prefers-reduced-motion media query.",
    fix: `/* Wrong — unconditional animation */
.card { animation: slide-in 0.3s ease; }

/* Correct */
.card { animation: none; }

@media (prefers-reduced-motion: no-preference) {
  .card { animation: slide-in 0.3s ease; }
}`,
    wcagUrl: "https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions",
    check: (html) => {
      const hasAnimation = /animation\s*:|@keyframes/i.test(html);
      const hasReducedMotion = /prefers-reduced-motion/i.test(html);
      return hasAnimation && !hasReducedMotion ? 1 : 0;
    },
  },
  {
    id: "reading-level",
    title: "Content should use plain language",
    criterion: "3.1.5",
    level: "AAA",
    impact: "minor",
    description: "AAA requires content to be understandable without requiring a higher secondary education level. Avoid jargon and provide simplified summaries for complex content.",
    fix: `<!-- Instead of: -->
"Utilise the aforementioned form to facilitate
your application submission process."

<!-- Write: -->
"Use this form to apply for the job."

<!-- Tools to check reading level: -->
<!-- hemingwayapp.com -->
<!-- readable.com -->`,
    wcagUrl: "https://www.w3.org/WAI/WCAG21/Understanding/reading-level",
    check: (html) => {
      const jargon = ["utilize","utilise","facilitate","aforementioned","herewith","pursuant","notwithstanding"];
      return jargon.some(w => new RegExp(`\\b${w}\\b`, "i").test(html)) ? 1 : 0;
    },
  },
];

/* ── Sample HTML snippets ── */
const SAMPLES = {
  "Bad Form": `<html>
<body>
<h1>Apply Now</h1>
<h3>Personal Details</h3>
<form>
  <input type="text" placeholder="Your name *">
  <input type="email" placeholder="Email *">
  <button><svg width="16" height="16"><path d="M2 12l10-10"/></svg></button>
  <span class="error">Invalid</span>
</form>
<a href="/jobs">Click here</a>
<img src="hero.jpg">
<table>
  <tr><td>Name</td><td>Role</td></tr>
  <tr><td>Sneha</td><td>Developer</td></tr>
</table>
<style>
  button:focus { outline: none; }
  .subtitle { color: #aaaaaa; }
  .card { animation: slide 0.3s ease; }
  @keyframes slide { from { opacity: 0; } }
</style>
</body>
</html>`,

  "Good Form": `<!DOCTYPE html>
<html lang="en">
<head><title>Apply - EnabledTalent</title></head>
<body>
<a href="#main" class="skip-link">Skip to main content</a>
<main id="main">
  <h1>Front-End Developer Application</h1>
  <h2>Personal Details</h2>
  <form aria-label="Job application">
    <label for="name">Full name <span aria-hidden="true">*</span></label>
    <input type="text" id="name" aria-required="true">
    <label for="email">Email address <span aria-hidden="true">*</span></label>
    <input type="email" id="email" aria-required="true">
    <button type="submit">Submit application</button>
    <span class="error" role="alert">
      Please enter a valid email address, e.g. name@example.com
    </span>
  </form>
  <a href="/jobs">Browse all open positions</a>
  <img src="hero.jpg" alt="Team collaborating on accessible software">
  <table>
    <thead><tr><th scope="col">Name</th><th scope="col">Role</th></tr></thead>
    <tbody><tr><td>Sneha</td><td>Developer</td></tr></tbody>
  </table>
  <style>
    .text { color: #1a1a2e; }
    @media (prefers-reduced-motion: no-preference) {
      .card { animation: slide 0.3s ease; }
    }
  </style>
</main>
</body>
</html>`,
};

/* ── Helpers ── */
const impactOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };

function getScore(violations, total) {
  if (total === 0) return 100;
  return Math.max(0, Math.round(((total - violations) / total) * 100));
}

function ScoreRing({ score }) {
  const r = 36, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "var(--ok)" : score >= 50 ? "var(--warn)" : "var(--err)";
  const label = score >= 80 ? "Good" : score >= 50 ? "Needs Work" : "Critical Issues";
  return (
    <div className="score-ring-wrap" aria-label={`Accessibility score: ${score} out of 100`}>
      <svg className="ring-svg" viewBox="0 0 90 90" aria-hidden="true">
        <circle className="ring-bg" cx="45" cy="45" r={r} />
        <circle className="ring-fill" cx="45" cy="45" r={r}
          stroke={color}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
        <text className="ring-score" x="45" y="45" fill={color}>{score}</text>
      </svg>
      <div className="ring-info">
        <h2 style={{ color }}>{label}</h2>
        <p>
          {score === 100
            ? "No violations detected. Great work — your HTML follows accessibility best practices!"
            : `Your score is ${score}/100. Review the violations below and fix them to improve accessibility.`}
        </p>
      </div>
    </div>
  );
}

function ViolationCard({ rule, count }) {
  const [open, setOpen] = useState(false);
  const bodyId = `body-${rule.id}`;
  return (
    <div className="violation-card">
      <button
        className="violation-header"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={bodyId}
      >
        <span className={`v-level-badge badge-${rule.level.toLowerCase()}`}>
          WCAG {rule.level}
        </span>
        <span className="v-title-wrap">
          <span className="v-title">{rule.title}</span>
          <span className="v-criterion">Success Criterion {rule.criterion}</span>
        </span>
        <span className="v-count" aria-label={`${count} instance${count !== 1 ? "s" : ""}`}>
          ×{count}
        </span>
        <svg className={`v-chevron${open ? " open" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="violation-body" id={bodyId}>
          <span className={`impact-tag impact-${rule.impact}`}>
            {rule.impact} impact
          </span>
          <p>{rule.description}</p>
          <div className="fix-label">How to fix</div>
          <pre className="fix-box"><code>{rule.fix}</code></pre>
          <a
            href={rule.wcagUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="wcag-ref"
            aria-label={`WCAG ${rule.criterion} understanding document (opens in new tab)`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Read WCAG {rule.criterion} Understanding Document
          </a>
        </div>
      )}
    </div>
  );
}

/* ── Main App ── */
export default function WCAGAuditTool() {
  const [html, setHtml] = useState("");
  const [results, setResults] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState("all");
  const [announcement, setAnnouncement] = useState("");

  const resultsRef = useRef(null);

  const runAudit = useCallback(async () => {
    if (!html.trim()) return;
    setScanning(true);
    setResults(null);
    setAnnouncement("Scanning HTML for accessibility violations…");
    await new Promise(r => setTimeout(r, 900));

    const violations = [];
    RULES.forEach(rule => {
      const count = rule.check(html);
      if (count > 0) violations.push({ rule, count });
    });
    violations.sort((a, b) => impactOrder[a.rule.impact] - impactOrder[b.rule.impact]);

    const score = getScore(violations.length, RULES.length);
    setResults({ violations, score });
    setScanning(false);

    const msg = violations.length === 0
      ? "Audit complete. No violations found!"
      : `Audit complete. Found ${violations.length} violation${violations.length !== 1 ? "s" : ""}.`;
    setAnnouncement(msg);
    setTimeout(() => resultsRef.current?.focus(), 100);
  }, [html]);

  const clear = () => { setHtml(""); setResults(null); setAnnouncement("Form cleared."); };

  const loadSample = (key) => {
    setHtml(SAMPLES[key]);
    setResults(null);
    setAnnouncement(`Loaded ${key} sample. Click Run Audit to analyse.`);
  };

  const filtered = results
    ? (filter === "all" ? results.violations : results.violations.filter(v => v.rule.level === filter))
    : [];

  const countByLevel = (lvl) => results?.violations.filter(v => v.rule.level === lvl).length ?? 0;

  return (
    <>
      <style>{CSS}</style>
      <a href="#audit-input" className="skip-link">Skip to audit input</a>
      <div aria-live="polite" aria-atomic="true" className="sr-only" role="status">{announcement}</div>

      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="header-top">
            <span className="logo">A11y<span>Check</span></span>
          </div>
          <h1>WCAG <em>Audit</em> Tool</h1>
          <p className="subtitle">
            Paste any HTML snippet and instantly check it against WCAG 2.1 success criteria
            across levels A, AA, and AAA. Get plain-English explanations and code fixes.
          </p>
          <div className="level-pills" aria-label="Covered WCAG levels">
            <span className="pill pill-a">Level A — {RULES.filter(r=>r.level==="A").length} rules</span>
            <span className="pill pill-aa">Level AA — {RULES.filter(r=>r.level==="AA").length} rules</span>
            <span className="pill pill-aaa">Level AAA — {RULES.filter(r=>r.level==="AAA").length} rules</span>
          </div>
        </header>

        {/* Input */}
        <section className="input-section" aria-labelledby="input-heading">
          <label className="input-label" htmlFor="audit-input" id="input-heading">
            Paste HTML to audit
          </label>
          <div className="textarea-wrap">
            <textarea
              id="audit-input"
              value={html}
              onChange={e => setHtml(e.target.value)}
              placeholder={`Paste your HTML here…\n\nExample:\n<img src="logo.png">\n<input type="text" placeholder="Name">\n<button><svg>…</svg></button>`}
              aria-describedby="input-hint"
              spellCheck={false}
            />
          </div>
          <p id="input-hint" className="sr-only">
            Paste any HTML snippet. The tool will check it against {RULES.length} WCAG 2.1 rules.
          </p>

          <div className="sample-btns" role="group" aria-label="Load sample HTML">
            <span className="sample-label">Try a sample:</span>
            {Object.keys(SAMPLES).map(k => (
              <button key={k} className="btn-sample" onClick={() => loadSample(k)}>
                {k}
              </button>
            ))}
          </div>

          <div className="btn-row">
            <button
              className="btn-primary"
              onClick={runAudit}
              disabled={!html.trim() || scanning}
              aria-busy={scanning}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              {scanning ? "Scanning…" : "Run Audit"}
            </button>
            <button className="btn-secondary" onClick={clear} disabled={!html && !results}>
              Clear
            </button>
          </div>
        </section>

        {/* Scanning indicator */}
        {scanning && (
          <div className="scanning" role="status" aria-live="polite">
            <span className="scan-dot" aria-hidden="true" />
            Checking {RULES.length} WCAG 2.1 rules across A, AA and AAA levels…
          </div>
        )}

        {/* Results */}
        {results && (
          <section
            aria-labelledby="results-heading"
            tabIndex={-1}
            ref={resultsRef}
          >
            <h2 id="results-heading" className="sr-only">Audit results</h2>

            <ScoreRing score={results.score} />

            {/* Score cards */}
            <div className="score-grid" role="group" aria-label="Violation summary">
              <div className="score-card total" aria-label={`${results.violations.length} total violations`}>
                <div className="score-num">{results.violations.length}</div>
                <div className="score-label">Total Violations</div>
              </div>
              <div className="score-card level-a" aria-label={`${countByLevel("A")} Level A violations`}>
                <div className="score-num">{countByLevel("A")}</div>
                <div className="score-label">Level A</div>
              </div>
              <div className="score-card level-aa" aria-label={`${countByLevel("AA")} Level AA violations`}>
                <div className="score-num">{countByLevel("AA")}</div>
                <div className="score-label">Level AA</div>
              </div>
              <div className="score-card level-aaa" aria-label={`${countByLevel("AAA")} Level AAA violations`}>
                <div className="score-num">{countByLevel("AAA")}</div>
                <div className="score-label">Level AAA</div>
              </div>
              <div className="score-card passed" aria-label={`${RULES.length - results.violations.length} rules passed`}>
                <div className="score-num">{RULES.length - results.violations.length}</div>
                <div className="score-label">Rules Passed</div>
              </div>
            </div>

            {results.violations.length === 0 ? (
              <div className="all-pass" role="status">
                <div className="pass-icon" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h3>No violations found!</h3>
                <p>Your HTML passed all {RULES.length} WCAG 2.1 checks. Well done — this is accessible code.</p>
              </div>
            ) : (
              <>
                {/* Filters */}
                <div className="filters" role="group" aria-label="Filter violations by WCAG level">
                  <span className="filter-label" id="filter-label">Filter:</span>
                  {[["all","All",`all`],["A","Level A","a"],["AA","Level AA","aa"],["AAA","Level AAA","aaa"]].map(([val, label, cls]) => (
                    <button
                      key={val}
                      className={`filter-btn ${cls}${filter === val ? " active" : ""}`}
                      onClick={() => setFilter(val)}
                      aria-pressed={filter === val}
                    >
                      {label} {val !== "all" && `(${countByLevel(val)})`}
                    </button>
                  ))}
                </div>

                <div className="results-section" aria-label={`${filtered.length} violation${filtered.length !== 1?"s":""} shown`}>
                  <h2>
                    {filtered.length} Violation{filtered.length !== 1 ? "s" : ""}
                    {filter !== "all" ? ` — Level ${filter}` : ""}
                  </h2>
                  {filtered.length === 0 ? (
                    <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No violations at this level.</p>
                  ) : (
                    filtered.map(({ rule, count }) => (
                      <ViolationCard key={rule.id} rule={rule} count={count} />
                    ))
                  )}
                </div>
              </>
            )}
          </section>
        )}

        {/* Empty state */}
        {!results && !scanning && (
          <div className="empty-state" aria-label="Waiting for input">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35M11 8v3M11 14h.01"/>
            </svg>
            <h3>Ready to audit</h3>
            <p>Paste your HTML above and click <strong>Run Audit</strong> to check it against {RULES.length} WCAG 2.1 accessibility rules — or load a sample to see it in action.</p>
          </div>
        )}
      </div>
    </>
  );
}
