---
title: "Othello AI"
technologies: "C, WASM, SolidJS, Web Worker"
cover: "./othello.svg"
coverAlt: "Plateau d'Othello en cours de partie, pions bleus contre pions noirs"
repoLink: "https://github.com/Elib27/portfolio/tree/main/src/components/Othello"
playable: true
order: 5
---

Un adversaire d'Othello contre lequel jouer directement sur cette page. L'IA est une recherche minimax écrite en C et compilée en WebAssembly : un binaire de 4 Ko, choisi pour la vitesse. Elle tourne dans un Web Worker, si bien que la page reste fluide pendant qu'elle réfléchit. L'interface est en SolidJS, les règles en TypeScript. Trois niveaux de difficulté : choisissez-en un et essayez de la battre.
