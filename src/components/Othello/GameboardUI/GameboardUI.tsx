import type { Component, Accessor } from "solid-js";
import type { Gameboard, Move } from "../othello";
import { Show, Index } from "solid-js";
import styles from "./GameboardUI.module.css";
import { AI_PLAYER, placeLegalMovesOnGameboard } from "../othello";

interface Props {
  gameboard: Accessor<Gameboard>;
  player: Accessor<string>;
  setPlayerCase: (move: Move) => void;
  lastAIMove: Accessor<Move | null>;
}

const GameboardUI: Component<Props> = (props) => {

  const gameboardWithPossibleMoves = () => placeLegalMovesOnGameboard(props.gameboard(), props.player());

  const gameboardToShow = () => props.player() === AI_PLAYER ? props.gameboard() : gameboardWithPossibleMoves();

  const showLastAIMove = (move: Move) => props.player() !== AI_PLAYER
                                        && props.lastAIMove()?.row === move.row
                                        && props.lastAIMove()?.column === move.column;

  return (
    <table class={styles.gameboard}>
    <tbody>
      <Index each={gameboardToShow()}>{(row, i) => 
        <tr class={styles.row}>
          <Index each={row()}>{(cell, j) =>
            <td
              class={styles.cell}
              onClick={() => props.setPlayerCase({row: i, column: j})}
            >
              <Show when={ cell() !== ' ' }>
                <div classList={{
                  [styles.piece]: true, 
                  [styles.accent]: cell() === 'x',
                  [styles.black]: cell() === 'o',
                  [styles.possibleMove]: cell() === '.',
                  [styles.lastAIMove]: showLastAIMove({row: i, column: j})
                  }}
                ></div>
              </Show>
            </td>
          }</Index>
        </tr> 
      }</Index>
    </tbody>
  </table>
  );
};

export default GameboardUI;