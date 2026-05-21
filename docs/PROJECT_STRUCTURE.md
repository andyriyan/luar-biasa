# PROJECT STRUCTURE

/
│
├── index.html
├── manifest.json
├── service-worker.js
│
├── assets/
│   ├── css/
│   ├── js/
│   ├── images/
│   ├── icons/
│   └── audio/
│
├── components/
│   ├── navbar.html
│   ├── footer.html
│   ├── lesson-card.html
│   ├── focus-panel.html
│   └── quiz-card.html
│
├── materi/
│   ├── materi-1/
│   ├── materi-2/
│   └── materi-template/
│
├── data/
│   ├── materi-list.json
│   ├── navigation.json
│   └── settings.json
│
├── docs/
│   ├── MASTER_PROMPT.md
│   ├── UX_RULES.md
│   ├── DESIGN_SYSTEM.md
│   ├── AI_RULES.md
│   └── PROJECT_STRUCTURE.md
│
└── prompts/


# STRUCTURE PRINCIPLES

- modular
- scalable
- maintainable
- AI-friendly
- reusable

---

# MATERIAL STRUCTURE

Setiap folder materi:

/materi/[slug]/
  ├── index.html
  ├── materi.json
  ├── quiz.json
  ├── images/
  └── assets/