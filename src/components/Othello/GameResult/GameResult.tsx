import type { Component } from 'solid-js';
import type { Gameboard } from '../othello';
import styles from './GameResult.module.css'
import { getWinner, getScore } from '../othello';

interface GameResultProps 
{
  gameboard: Gameboard;
};

const GameResult: Component<GameResultProps> = (props) => {

  const winner = getWinner(props.gameboard);
  const score = getScore(props.gameboard);

  function winnerText(winner: string) {
    if (winner === 'draw') return 'Draw: no winner !';
    if (winner === 'x') return 'You won !';
    return 'You lost !';
  }

  return (
    <div class={styles.container}>
      <h2 class={styles.title}>Results</h2>
      <p class={styles.winnerText}>{winnerText(winner)}</p>
      <h2 class={styles.scoreTitle}>Score</h2>
      <div class={styles.scoreContainer}>
        <div class={styles.score}>
          <div class={[styles.piece, styles.player].join(' ')}></div>
          {score.x}
        </div>
        <div class={styles.score}>
          <div class={[styles.piece, styles.AIplayer].join(' ')}></div>
          {score.o}
        </div>
      </div>
    </div>
  )
};


export default GameResult;