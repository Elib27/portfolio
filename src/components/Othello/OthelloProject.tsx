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
        <p class={styles.description}>Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetu 5 BC, making it over 2000 years old. Richard McClintock.</p>
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