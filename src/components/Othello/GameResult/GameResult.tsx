import type { Component } from "solid-js";
import { Show } from "solid-js";
import type { Gameboard } from "../othello";
import type { OthelloLabels } from "../labels";
import styles from "./GameResult.module.css";
import { getWinner, getScore } from "../othello";

interface GameResultProps {
  gameboard: Gameboard;
  labels: OthelloLabels;
  onPlayAgain: () => void;
  // Only offered after a loss above the easiest level
  onTryEasier?: () => void;
}

const GameResult: Component<GameResultProps> = (props) => {
  const winner = () => getWinner(props.gameboard);
  const score = () => getScore(props.gameboard);

  const title = () => {
    if (winner() === "draw") return props.labels.draw;
    return winner() === "x" ? props.labels.won : props.labels.lost;
  };

  return (
    <div class={styles.overlay}>
      <div class={styles.card}>
        <h4 class={styles.title}>{title()}</h4>
        <p class={styles.score}>
          <span class={`${styles.dot} ${styles.you}`} aria-hidden="true" />
          <span>
            <span class={styles.srOnly}>{props.labels.you} </span>
            {score().x}
          </span>
          <span class={styles.dash} aria-hidden="true">
            –
          </span>
          <span>
            <span class={styles.srOnly}>{props.labels.ai} </span>
            {score().o}
          </span>
          <span class={`${styles.dot} ${styles.ai}`} aria-hidden="true" />
        </p>
        <button type="button" class={styles.primary} onClick={props.onPlayAgain}>
          {props.labels.playAgain}
        </button>
        <Show when={props.onTryEasier}>
          <button
            type="button"
            class={styles.secondary}
            onClick={() => props.onTryEasier?.()}
          >
            {props.labels.tryEasier}
          </button>
        </Show>
      </div>
    </div>
  );
};

export default GameResult;
