---
title: "Othello AI"
technologies: "C, WASM, SolidJS, Web Worker"
cover: "./othello.svg"
coverAlt: "Othello board mid-game, blue pieces against black ones"
repoLink: "https://github.com/Elib27/portfolio/tree/main/src/components/Othello"
playable: true
order: 5
---

An Othello opponent you can play right here, on this page. The AI is a minimax search written in C and compiled to WebAssembly: a 4 KB binary, chosen for speed. It runs in a Web Worker, so the page stays smooth while it thinks. The interface is SolidJS and the rules are plain TypeScript. Three difficulty levels: pick one and try to beat it.
