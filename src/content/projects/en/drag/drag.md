---
title: 'Drag: a Self-Healing RAG Assistant'
technologies: 'TypeScript, RAG, Botpress ADK'
cover: './drag.svg'
coverAlt: 'The Drag self-healing loop: an "I don''t know" goes to an expert, the expert answers, and the next asker gets the answer'
demoLink: '/projects/drag'
repoLink: ''
order: 2
---

An information-security assistant I designed and shipped on my own at Botpress. It answers employees' policy questions in Slack and fills in customer security questionnaires, citing the source policy for every answer. When it can't fully answer, a self-healing loop sends the gap to the security experts and turns their reply into the next person's answer. It saves about 19 hours of work a month.
