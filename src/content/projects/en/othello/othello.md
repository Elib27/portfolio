---
title: "Othello AI"
technologies: "C, WASM, SolidJS, Web Worker"
cover: "./othello.svg"
coverAlt: "Othello board mid-game, blue pieces against black ones"
repoLink: "https://github.com/Elib27/portfolio/tree/main/src/components/Othello"
playable: true
order: 6
---

A playable Othello game with an AI opponent. The game logic is in TypeScript and the board UI in SolidJS. The AI is a minimax search written in C and compiled to WebAssembly. It runs in a Web Worker, so the page stays responsive while it looks moves ahead. Three difficulty levels: pick one and try to finish with more discs than it does.
