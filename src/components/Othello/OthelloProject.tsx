import type { Component } from 'solid-js';
import { lazy, createSignal, Show, For} from 'solid-js'
import styles from './OthelloProject.module.css'

const OthelloGame = lazy(() => import('./OthelloGame/OthelloGame'));

type Props = {
  buttonTitle: string,
  description: string
}

const OthelloProject: Component<Props> = (props) => {

  const [isProjectOpen, setIsProjectOpen] = createSignal(false);

  const technos = ["SolidJS", "WASM", "Web Worker"];

  return (
    <Show when={isProjectOpen()} fallback={<button class={styles.projectButton} onClick={() => setIsProjectOpen(true)}>{props.buttonTitle}</button>}>
      <div class={styles.projectWrapper}>
        <h3 class={styles.projectTitle}>Othello AI</h3>
        <p class={styles.description}>{props.description}</p>
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