# wcag-audit-tool
# 🔍 WCAG Audit Tool

An interactive accessibility auditing tool built with React. Paste any HTML snippet and instantly check it against **15 WCAG 2.1 success criteria** across levels A, AA, and AAA — with plain-English explanations, impact ratings, and code fixes for every violation.

**[Live Demo](https://vercel.com/snehagit-webs-projects/wcag-audit-tool)** · **[View Code](https://github.com/SnehaGit-web/wcag-audit-tool)**

---

## 🎯 Why I Built This

Most developers know accessibility matters but don't know where to start. This tool makes WCAG 2.1 tangible — paste real HTML, see real violations, get real fixes. Built to demonstrate deep understanding of accessibility standards and to help other developers learn.

> **Tip:** Run this tool against any website's HTML (copy from browser DevTools → Elements → right-click → Copy outer HTML) to get an instant accessibility report.

---

## ✨ Features

- ✅ **15 WCAG 2.1 rules** covering levels A, AA, and AAA
- ✅ **Accessibility score** (0–100) with visual ring indicator
- ✅ **Filter by level** — view A, AA, or AAA violations separately
- ✅ **Expandable violation cards** with plain-English descriptions
- ✅ **Code fix examples** for every violation
- ✅ **Impact ratings** — critical, serious, moderate, minor
- ✅ **Direct links** to WCAG Understanding documents
- ✅ **Built-in sample HTML** — "Bad Form" and "Good Form" to demo instantly
- ✅ **The tool itself is fully accessible** — keyboard navigable, screen reader tested

---

## 📋 Rules Covered

### Level A — Minimum Accessibility
| Rule | WCAG Criterion |
|------|---------------|
| Images must have alternative text | 1.1.1 Non-text Content |
| Form inputs must have associated labels | 1.3.1 Info and Relationships |
| Headings must not skip levels | 1.3.1 Info and Relationships |
| Page must have a lang attribute | 3.1.1 Language of Page |
| Buttons must have discernible text | 4.1.2 Name, Role, Value |
| Links must have descriptive text | 2.4.4 Link Purpose |
| Required fields must be marked | 3.3.2 Labels or Instructions |
| Tables must have header cells | 1.3.1 Info and Relationships |

### Level AA — Standard Compliance
| Rule | WCAG Criterion |
|------|---------------|
| Focus indicator must not be suppressed | 2.4.7 Focus Visible |
| Text must meet colour contrast ratio (4.5:1) | 1.4.3 Contrast Minimum |
| Page must have a skip navigation link | 2.4.1 Bypass Blocks |
| Form errors must include suggestions | 3.3.3 Error Suggestion |

### Level AAA — Enhanced Accessibility
| Rule | WCAG Criterion |
|------|---------------|
| Text must meet enhanced contrast ratio (7:1) | 1.4.6 Contrast Enhanced |
| Animations must respect prefers-reduced-motion | 2.3.3 Animation from Interactions |
| Content should use plain language | 3.1.5 Reading Level |

---

## ♿ The Tool Is Accessible Too

This audit tool practises what it preaches. It was built to meet WCAG 2.1 AA standards:

| Feature | Implementation |
|---------|---------------|
| Skip link | First focusable element jumps to audit input |
| Screen reader announcements | `aria-live="polite"` announces scan start and results |
| Keyboard navigation | Full tab order — all buttons, filters, and cards operable without mouse |
| Expandable cards | `aria-expanded` and `aria-controls` on all accordion buttons |
| Filter buttons | `aria-pressed` state on all filter toggles |
| Score ring | `aria-label` provides score as text for screen readers |
| Loading state | `aria-busy="true"` on scan button during processing |
| Focus management | Results section receives focus after scan completes |

---

## 🧪 How the Rules Work

Each rule uses a lightweight HTML string parser — no external dependencies. For example, the image alt text rule:

```javascript
check: (html) => {
  const imgs = [...html.matchAll(/<img[^>]*>/gi)];
  const violations = imgs.filter(m => !/alt\s*=/i.test(m[0]));
  return violations.length;
}
```

This approach was intentional — it demonstrates understanding of the underlying accessibility requirements without hiding logic behind a black-box library.

> For production use, integrate **axe-core** or **Lighthouse CI** for more comprehensive automated testing. Automated tools catch ~30–40% of WCAG issues; the remaining require manual testing with real assistive technologies.

---

## 🛠 Tech Stack

- **React 18** — component architecture and state management
- **Vite** — fast build tooling
- **Plain CSS** — no CSS framework, full control
- **Google Fonts** — Syne + IBM Plex Mono + Lato
- **Zero accessibility libraries** — all ARIA hand-authored

---

## 🚀 Run Locally

```bash
git clone https://github.com/SnehaGit-web/wcag-audit-tool.git
cd wcag-audit-tool
npm install
npm run dev
```

Opens at `http://localhost:5173`

**Build for production:**
```bash
npm run build
```

---

## 📸 How to Use

1. **Paste any HTML** into the text area
2. Click **Run Audit**
3. Review your **accessibility score** and violation summary
4. Click any **violation card** to expand it and see:
   - What the issue is and why it matters
   - How severe the impact is
   - A code example showing the fix
   - A link to the official WCAG understanding document
5. Use the **level filters** to focus on A, AA, or AAA violations

**Try the built-in samples** — click "Bad Form" to see a HTML snippet with multiple violations, then "Good Form" to see the corrected version.

---

## 🔮 Planned Improvements

- [ ] URL input — paste a live website URL and audit it directly
- [ ] Export report as PDF
- [ ] axe-core integration for more comprehensive rule coverage
- [ ] Colour contrast ratio calculator
- [ ] AODA-specific rule set for Ontario compliance

---

## 📚 References

- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/)
- [AODA Integrated Accessibility Standards](https://www.ontario.ca/laws/regulation/110191)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## 👩‍💻 About

Built by **Sneha Ann George** — Full-Stack Developer based in Windsor, ON, Canada.

Passionate about building software that works for everyone — including the 1 in 4 Canadians living with a disability.

[LinkedIn](https://linkedin.com/in/sneha-ann-george) · [GitHub](https://github.com/SnehaGit-web) · [Email](mailto:snehaanngeorge.ca@gmail.com)
