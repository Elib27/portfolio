import type { Component } from "solid-js";
import type { Move, Gameboard } from "../othello";
import { createSignal, onMount, Show } from "solid-js";
import styles from "./OthelloGame.module.css";
import GameResult from "../GameResult/GameResult";
import GameboardUI from "../GameboardUI/GameboardUI";
import AIworker from "../AIworker.js?worker";
import {
  AI_PLAYER,
  initializeGameBoard,
  cloneGameboard,
  isMoveValid,
  playMove,
  checkIfGameEnd,
  getLegalMoves,
} from "../othello";

const OthelloGame: Component = () => {
  const [gameboard, setGameboard] = createSignal<Gameboard>(
    initializeGameBoard(),
  );
  const [player, setPlayer] = createSignal("x");
  const [isGameEnd, setIsGameEnd] = createSignal(false);
  const [difficulty, setDifficulty] = createSignal(1);
  const [lastAIMove, setLastAIMove] = createSignal<Move | null>(null);
  const [flippedCells, setFlippedCells] = createSignal<Set<string>>(new Set());
  const [placedCell, setPlacedCell] = createSignal<string | null>(null);

  const MIN_AI_TURN_TIME = 1000;
  let startAIturnTime = 0;

  const updateGameEnd = () => setIsGameEnd(checkIfGameEnd(gameboard()));

  const difficultyText = () => {
    switch (difficulty()) {
      case 0:
        return "Easy";
      case 1:
        return "Medium";
      case 2:
        return "Hard";
      default:
        return "Medium";
    }
  };

  function withDelay<T>(callback: () => T, delay: number) {
    const funcTimeOut = setTimeout(callback, delay);
    return funcTimeOut;
  }

  function getFlippedCells(
    oldBoard: Gameboard,
    newBoard: Gameboard,
    placedMove: Move,
  ): Set<string> {
    const flipped = new Set<string>();
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (i === placedMove.row && j === placedMove.column) continue;
        const oldVal = oldBoard[i][j];
        const newVal = newBoard[i][j];
        if (oldVal !== " " && oldVal !== "." && newVal !== oldVal) {
          flipped.add(`${i},${j}`);
        }
      }
    }
    return flipped;
  }

  let getAImove: (
    gameboard: Gameboard,
    player: string,
    difficulty: number,
  ) => void;

  let timeOutAImoveID: number | undefined;

  onMount(() => {
    const othelloAIworker = new AIworker();
    getAImove = (gameboard: Gameboard, player: string, difficulty: number) =>
      othelloAIworker.postMessage({ gameboard, player, difficulty });

    othelloAIworker.onmessage = (event) => {
      const ellapsedAIturnTime = Date.now() - startAIturnTime;
      const timeToWait = MIN_AI_TURN_TIME - ellapsedAIturnTime;
      timeOutAImoveID = withDelay(
        () => playAImove(event.data.move),
        timeToWait,
      );
    };
  });

  function updateGameboardWithMove(move: Move, player: string) {
    setFlippedCells(new Set<string>());
    setPlacedCell(`${move.row},${move.column}`);
    const oldBoard = gameboard();
    const newGameboard = cloneGameboard(oldBoard);
    playMove(move, player, newGameboard);
    const flipped = getFlippedCells(oldBoard, newGameboard, move);
    setFlippedCells(flipped);
    setGameboard(newGameboard);
    if (flipped.size > 0) {
      setTimeout(() => setFlippedCells(new Set<string>()), 350);
    }
    setTimeout(() => setPlacedCell(null), 200);
  }

  function playAImove(move: Move) {
    updateGameboardWithMove(move, player());
    setLastAIMove(move);
    setPlayer("x");
    updateGameEnd();
    const playerLegalMoves = getLegalMoves(player(), gameboard());
    if (playerLegalMoves.length === 0) requestAImove();
  }

  function reset() {
    if (player() === AI_PLAYER) clearInterval(timeOutAImoveID);
    setGameboard(initializeGameBoard());
    setPlayer("x");
    setLastAIMove(null);
    setIsGameEnd(false);
    setFlippedCells(new Set<string>());
    setPlacedCell(null);
  }

  function changeDifficulty() {
    reset();
    setDifficulty((d) => (d + 1) % 3);
  }

  function requestAImove() {
    const AIlegalMoves = getLegalMoves(AI_PLAYER, gameboard());
    if (AIlegalMoves.length === 0) return;
    setPlayer("o");
    startAIturnTime = Date.now();
    getAImove(gameboard(), AI_PLAYER, difficulty());
  }

  function setPlayerCase(move: Move) {
    if (player() === AI_PLAYER) return;
    if (!isMoveValid(move, player(), gameboard())) return;
    updateGameboardWithMove(move, player());
    setLastAIMove(null);
    updateGameEnd();
    requestAImove();
  }

  return (
    <div class={styles.layout}>
      <div
        classList={{
          [styles.playerRound]: true,
          [styles.aiThinking]: player() === AI_PLAYER,
        }}
      >
        <span
          classList={{
            [styles.statusDot]: true,
            [styles.statusDotPlayer]: player() !== AI_PLAYER,
            [styles.statusDotAI]: player() === AI_PLAYER,
          }}
        ></span>
        {player() === AI_PLAYER ? "AI is thinking..." : "Your turn"}
      </div>
      <div class={styles.centerWrapper}>
        <Show when={isGameEnd()}>
          <GameResult gameboard={gameboard()} onReset={reset} />
        </Show>
        <GameboardUI
          gameboard={gameboard}
          player={player}
          setPlayerCase={setPlayerCase}
          lastAIMove={lastAIMove}
          flippedCells={flippedCells}
          placedCell={placedCell}
        />
      </div>
      <div class={styles.controlRow}>
        <button
          classList={{
            [styles.resetButton]: true,
            [styles.resetButtonAccent]: isGameEnd(),
          }}
          onClick={reset}
        >
          Reset
        </button>
        <button class={styles.resetButton} onClick={changeDifficulty}>
          Difficulty: {difficultyText()}
        </button>
      </div>
    </div>
  );
};

export default OthelloGame;
