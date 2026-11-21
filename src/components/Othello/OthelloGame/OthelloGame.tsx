import type { Component } from "solid-js";
import { createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import type { Gameboard, Move } from "../othello";
import type { OthelloLabels } from "../labels";
import styles from "./OthelloGame.module.css";
import GameResult from "../GameResult/GameResult";
import GameboardUI from "../GameboardUI/GameboardUI";
import AIworker from "../AIworker.js?worker";
import {
  AI_PLAYER,
  initializeGameBoard,
  cloneGameboard,
  playMove,
  checkIfGameEnd,
  getLegalMoves,
  getScore,
  getWinner,
  getFlippedPieces,
} from "../othello";

const HUMAN = "x";
// The AI answers in a few ms; a short pause makes its move readable
const MIN_AI_TURN_TIME = 700;
const FLIP_DURATION = 400;
const FLIP_STAGGER = 60;

type AIStatus = "loading" | "ready" | "error";

type Props = {
  labels: OthelloLabels;
  onReady?: () => void;
  onClose?: () => void;
};

const OthelloGame: Component<Props> = (props) => {
  const [gameboard, setGameboard] = createSignal<Gameboard>(initializeGameBoard());
  const [turn, setTurn] = createSignal(HUMAN);
  const [isGameOver, setIsGameOver] = createSignal(false);
  const [difficulty, setDifficulty] = createSignal(1);
  const [aiStatus, setAIStatus] = createSignal<AIStatus>("loading");
  const [lastAIMove, setLastAIMove] = createSignal<Move | null>(null);
  const [placedCell, setPlacedCell] = createSignal<string | null>(null);
  const [flips, setFlips] = createSignal(new Map<string, number>());
  // One-off message, e.g. when a player has to pass
  const [notice, setNotice] = createSignal<string | null>(null);

  const levels = () => [props.labels.easy, props.labels.medium, props.labels.hard];
  const score = createMemo(() => getScore(gameboard()));
  const yourShare = () => {
    const { x, o } = score();
    return (x / (x + o)) * 100;
  };
  const legalMoves = createMemo(() =>
    turn() === HUMAN && !isGameOver() ? getLegalMoves(HUMAN, gameboard()) : [],
  );
  const isAIThinking = () =>
    aiStatus() === "ready" && turn() === AI_PLAYER && !isGameOver();
  const locked = () =>
    aiStatus() !== "ready" || turn() !== HUMAN || isGameOver();

  const resultText = () => {
    const winner = getWinner(gameboard());
    if (winner === "draw") return props.labels.draw;
    return winner === HUMAN ? props.labels.won : props.labels.lost;
  };

  const status = () => {
    if (aiStatus() === "error") return props.labels.aiError;
    if (aiStatus() === "loading") return props.labels.loadingAI;
    if (isGameOver()) return resultText();
    return (
      notice() ??
      (turn() === AI_PLAYER ? props.labels.aiThinking : props.labels.yourTurn)
    );
  };

  let worker: Worker | undefined;
  // Bumped on every new game so a late AI answer for an old game is ignored
  let gameId = 0;
  let aiRequestedAt = 0;
  let aiMoveTimeout: ReturnType<typeof setTimeout> | undefined;
  let flipsTimeout: ReturnType<typeof setTimeout> | undefined;
  let placedTimeout: ReturnType<typeof setTimeout> | undefined;

  onMount(() => {
    worker = new AIworker();
    worker.onmessage = (event) => {
      const data = event.data;
      if (data.type === "ready") setAIStatus("ready");
      else if (data.type === "error") setAIStatus("error");
      else if (data.type === "move" && data.gameId === gameId) {
        const wait = MIN_AI_TURN_TIME - (Date.now() - aiRequestedAt);
        aiMoveTimeout = setTimeout(
          () => applyMove(data.move, AI_PLAYER),
          Math.max(0, wait),
        );
      }
    };
    worker.onerror = () => setAIStatus("error");
    props.onReady?.();
  });

  onCleanup(() => {
    worker?.terminate();
    clearTimeout(aiMoveTimeout);
    clearTimeout(flipsTimeout);
    clearTimeout(placedTimeout);
  });

  function requestAIMove() {
    aiRequestedAt = Date.now();
    worker?.postMessage({
      gameboard: gameboard(),
      player: AI_PLAYER,
      difficulty: difficulty(),
      gameId,
    });
  }

  function applyMove(move: Move, player: string) {
    const before = gameboard();
    const id = `${move.row},${move.column}`;

    // Flips ripple out from the placed piece
    const flipped = new Map<string, number>();
    for (const piece of getFlippedPieces(move, player, before)) {
      const distance = Math.max(
        Math.abs(piece.row - move.row),
        Math.abs(piece.column - move.column),
      );
      flipped.set(`${piece.row},${piece.column}`, (distance - 1) * FLIP_STAGGER);
    }

    const after = cloneGameboard(before);
    playMove(move, player, after);

    setFlips(flipped);
    setPlacedCell(id);
    setLastAIMove(player === AI_PLAYER ? move : null);
    setGameboard(after);

    clearTimeout(flipsTimeout);
    const longestDelay = Math.max(0, ...flipped.values());
    flipsTimeout = setTimeout(
      () => setFlips(new Map()),
      longestDelay + FLIP_DURATION + 50,
    );
    clearTimeout(placedTimeout);
    placedTimeout = setTimeout(() => setPlacedCell(null), 200);

    passTurn(player);
  }

  // Hands the turn to the other player, or back if they have no legal move
  function passTurn(justPlayed: string) {
    const board = gameboard();
    if (checkIfGameEnd(board)) {
      setNotice(null);
      setIsGameOver(true);
      return;
    }
    const other = justPlayed === HUMAN ? AI_PLAYER : HUMAN;
    if (getLegalMoves(other, board).length > 0) {
      setNotice(null);
      setTurn(other);
    } else {
      setNotice(other === HUMAN ? props.labels.youPass : props.labels.aiPasses);
      setTurn(justPlayed);
    }
    if (turn() === AI_PLAYER) requestAIMove();
  }

  function playHumanMove(move: Move) {
    if (locked()) return;
    applyMove(move, HUMAN);
  }

  function newGame() {
    gameId++;
    clearTimeout(aiMoveTimeout);
    clearTimeout(flipsTimeout);
    setGameboard(initializeGameBoard());
    setTurn(HUMAN);
    setIsGameOver(false);
    setLastAIMove(null);
    setFlips(new Map());
    setPlacedCell(null);
    setNotice(null);
  }

  function tryEasier() {
    setDifficulty((d) => Math.max(0, d - 1));
    newGame();
  }

  return (
    <div class={styles.layout}>
      <Show when={props.onClose}>
        <button
          type="button"
          class={styles.close}
          aria-label={props.labels.close}
          onClick={() => props.onClose?.()}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </Show>

      <div class={styles.top}>
        <div class={styles.scoreboard}>
          <div
            class={styles.side}
            data-active={turn() === HUMAN && !isGameOver() ? "" : undefined}
          >
            <span class={`${styles.dot} ${styles.dotYou}`} />
            <span class={styles.name}>{props.labels.you}</span>
            <span class={styles.count}>{score().x}</span>
          </div>
          <div
            class={styles.side}
            data-active={turn() === AI_PLAYER && !isGameOver() ? "" : undefined}
          >
            <span class={`${styles.dot} ${styles.dotAI}`} />
            <span class={styles.name}>
              {props.labels.ai}
              <Show when={isAIThinking()}>
                <span class={styles.thinking} aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </Show>
            </span>
            <span class={styles.count}>{score().o}</span>
          </div>
          <div class={styles.bar} aria-hidden="true">
            <span style={{ width: `${yourShare()}%` }} />
          </div>
        </div>
        <p class={styles.status} aria-live="polite">
          {status()}
        </p>
      </div>

      <div class={styles.boardArea}>
        <GameboardUI
          gameboard={gameboard}
          legalMoves={legalMoves}
          locked={locked}
          lastAIMove={lastAIMove}
          flips={flips}
          placedCell={placedCell}
          onPlay={playHumanMove}
          labels={props.labels}
        />
        <Show when={isGameOver()}>
          <GameResult
            gameboard={gameboard()}
            labels={props.labels}
            onPlayAgain={newGame}
            onTryEasier={
              getWinner(gameboard()) === AI_PLAYER && difficulty() > 0
                ? tryEasier
                : undefined
            }
          />
        </Show>
      </div>

      <div class={styles.controls}>
        <div class={styles.difficulty}>
          <span class={styles.label} id="othello-difficulty-label">
            {props.labels.difficulty}
          </span>
          <div
            class={styles.segmented}
            role="group"
            aria-labelledby="othello-difficulty-label"
          >
            <For each={levels()}>
              {(level, index) => (
                <button
                  type="button"
                  class={styles.segment}
                  aria-pressed={difficulty() === index()}
                  onClick={() => setDifficulty(index())}
                >
                  {level}
                </button>
              )}
            </For>
          </div>
        </div>
        <button type="button" class={styles.newGame} onClick={newGame}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          {props.labels.newGame}
        </button>
      </div>
    </div>
  );
};

export default OthelloGame;
