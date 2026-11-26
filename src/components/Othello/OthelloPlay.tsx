import type { Component } from "solid-js";
import { createEffect, createSignal, lazy, onMount, Show, Suspense } from "solid-js";
import { Portal } from "solid-js/web";
import type { OthelloLabels } from "./labels";
import styles from "./OthelloPlay.module.css";

const OthelloGame = lazy(() => import("./OthelloGame/OthelloGame"));

type Props = {
  // Element (rendered by Project.astro, below the row) the game is mounted into
  panelId: string;
  // Opening the page with this hash (e.g. "#othello") opens the game
  deepLinkHash?: string;
  labels: OthelloLabels;
};

// "Play" button for the Othello row. The game (and its WASM worker) is only
// loaded on first click, then kept mounted so closing doesn't lose the game.
const OthelloPlay: Component<Props> = (props) => {
  const [loaded, setLoaded] = createSignal(false);
  const [open, setOpen] = createSignal(false);
  let panel: HTMLElement | null = null;
  let button!: HTMLButtonElement;

  onMount(() => {
    panel = document.getElementById(props.panelId);
    if (props.deepLinkHash && location.hash === props.deepLinkHash) toggle();
  });

  // The panel is a grid row of the project; hiding it removes the row gap too
  createEffect(() => {
    const isOpen = open();
    if (panel) panel.hidden = !isOpen;
  });

  const scrollToPanel = () =>
    panel?.scrollIntoView({ behavior: "smooth", block: "start" });

  function toggle() {
    if (open()) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (loaded()) requestAnimationFrame(scrollToPanel);
    else setLoaded(true); // scrolls once the game has mounted (onReady)
  }

  return (
    <>
      <button
        ref={button}
        type="button"
        class="link primary theme-inverted"
        aria-expanded={open()}
        aria-controls={props.panelId}
        onClick={toggle}
      >
        <span>{open() ? props.labels.close : props.labels.play}</span>
        <Show
          when={open()}
          fallback={
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
            </svg>
          }
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </Show>
      </button>
      <Show when={loaded() && panel}>
        <Portal mount={panel!}>
          <div class={styles.panel}>
            <Suspense
              fallback={
                // Same footprint as the game, so nothing jumps when it loads
                <div class={styles.skeleton} aria-hidden="true">
                  <div class={styles.skeletonBoard} />
                  <div class={styles.skeletonSide} />
                </div>
              }
            >
              <OthelloGame
                labels={props.labels}
                onReady={scrollToPanel}
                onClose={() => {
                  setOpen(false);
                  button.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              />
            </Suspense>
          </div>
        </Portal>
      </Show>
    </>
  );
};

export default OthelloPlay;
