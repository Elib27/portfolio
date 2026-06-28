---
title: 'Fine-Tuning Tiny LLMs to Write Git Commits'
technologies: 'Python, LoRA, Unsloth'
cover: './commits-fine-tuning.svg'
coverAlt: 'Training and evaluation loss curves for the Qwen2.5-Coder-1.5B fine-tune'
demoLink: '/projects/commits-fine-tuning'
repoLink: 'https://github.com/Elib27/commit-message-finetuning'
---

An end-to-end ML project: I fine-tuned small, open-weight LLMs to turn a git diff into a clean Conventional Commit message — running fully offline as a git hook, so your code never leaves your machine. It spans the whole pipeline: ~12k diff/message pairs scraped from 13 disciplined TypeScript repos, LoRA fine-tuning with Unsloth, a three-layer evaluation (ROUGE-L, structural checks, and an LLM-as-judge), and deployment with Ollama. The headline result: a tiny fine-tuned model beats prompting one several times larger.
