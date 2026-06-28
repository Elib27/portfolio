---
title: "Fine-tuner un petit LLM pour écrire ses commits Git"
technologies: "Python, LoRA, Unsloth"
cover: "./commits-fine-tuning.svg"
coverAlt: "Courbes de loss d'entraînement et d'évaluation du fine-tune Qwen2.5-Coder-1.5B"
demoLink: "/projects/commits-fine-tuning"
repoLink: "https://github.com/Elib27/commit-message-finetuning"
---

Un projet ML de bout en bout : j'ai fine-tuné de petits modèles open-weight pour transformer un diff git en un message de commit conventionnel propre — le tout 100 % en local, via un hook git, sans jamais envoyer votre code ailleurs. Il couvre toute la chaîne : ~12k paires diff/message issues de 13 dépôts TypeScript rigoureux, fine-tuning LoRA avec Unsloth, une évaluation en trois couches (ROUGE-L, vérifications structurelles, LLM-as-judge) et un déploiement avec Ollama. Le résultat marquant : un petit modèle fine-tuné surpasse un modèle plusieurs fois plus gros utilisé en prompt.
