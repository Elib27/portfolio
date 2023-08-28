import type { Component } from 'solid-js';
import { lazy, createSignal, Show, For} from 'solid-js'
import styles from './OthelloProject.module.css'

const OthelloGame = lazy(() => import('./OthelloGame/OthelloGame'));

const OthelloProject: Component = () => {

  const [isProjectOpen, setIsProjectOpen] = createSignal(false);

  const technos = ["SolidJS", "WASM", "Web Worker"];

  return (
    <Show when={isProjectOpen()} fallback={<button class={styles.projectButton} onClick={() => setIsProjectOpen(true)}>Un dernier projet ?</button>}>
      <div class={styles.projectWrapper}>
        <h3 class={styles.projectTitle}>Othello AI</h3>
        <p class={styles.description}>Ce projet est une implémentation d&apos;IA jouant au jeu Othello, dont l&apos;objectif est d&apos;avoir le plus de pions de votre couleur sur le plateau à la fin de la partie. 
        J&apos;ai choisi d&apos;utiliser SolidJS pour gérer le côté dynamique et Typescript pour la logique du jeu. 
        L&apos;IA repose sur l&apos;algorithme minimax, écrit en C et compilé en WASM pour des performances optimales. 
        Elle est exécutée sur un web worker pour ne pas entraver la fluidité de la page durant le calcul du prochain coup. 
        Vous pouvez essayer par vous-même en jouant une partie et en choisissant le niveau de l&apos;IA !</p>
        <div class={styles.technologies}>
          <For each={technos}>
            {(techno) => <span class={styles.techno}>{techno}</span>}
          </For>
        </div>
        <OthelloGame />
      </div>
    </Show>
  )
};

export default OthelloProject;