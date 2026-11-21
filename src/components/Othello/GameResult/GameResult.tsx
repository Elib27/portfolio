import type { Component } from "solid-js";
import type { Gameboard } from "../othello";
import type { OthelloLabels } from "../labels";
import styles from "./GameResult.module.css";
import { getWinner, getScore } from "../othello";

interface GameResultProps {
  gameboard: Gameboard;
  onReset: () => void;
  labels: OthelloLabels;
}

const GameResult: Component<GameResultProps> = (props) => {
  const winner = getWinner(props.gameboard);
  const score = getScore(props.gameboard);

  function winnerText(winner: string) {
    if (winner === "draw") return props.labels.draw;
    if (winner === "x") return props.labels.won;
    return props.labels.lost;
  }

  return (
    <div class={styles.container}>
      <h2 class={styles.title}>{props.labels.results}</h2>
      <p class={styles.winnerText}>{winnerText(winner)}</p>
      <h2 class={styles.scoreTitle}>{props.labels.score}</h2>
      <div class={styles.scoreContainer}>
        <div class={styles.score}>
          <div class={[styles.piece, styles.player].join(" ")}></div>
          {score.x}
        </div>
        <div class={styles.score}>
          <div class={[styles.piece, styles.AIplayer].join(" ")}></div>
          {score.o}
        </div>
      </div>
      <button class={styles.playAgainButton} onClick={props.onReset}>
        {props.labels.playAgain}
      </button>
    </div>
  );
};

export default GameResult;
