---
title: 'Drag: a Self-Healing RAG Assistant'
technologies: 'TypeScript, RAG, Botpress ADK'
cover: './drag.svg'
coverAlt: 'Diagram of the Drag self-healing loop: question, answer, gap forwarded to experts, SAVE, next answer'
demoLink: '/projects/drag'
repoLink: ''
---

An information-security assistant I designed and shipped on my own at Botpress. It answers employees' policy questions in Slack and fills in customer security questionnaires, citing the source policy for every answer. When it can't fully answer, a self-healing loop sends the gap to the security experts and turns their reply into the next person's answer. It saves about 19 hours of work a month.
