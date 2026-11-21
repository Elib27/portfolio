import type { Component } from "solid-js";
import { batch, createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import type { Gameboard, Move, Player } from "../othello";
import type { OthelloLabels } from "../labels";
import type { MoveRequest, WorkerMessage } from "../messages";
import type { LastMove } from "../GameboardUI/GameboardUI";
import styles from "./OthelloGame.module.css";
import GameResult from "../GameResult/GameResult";
import GameboardUI, { squareKey } from "../GameboardUI/GameboardUI";
import AIworker from "../AIworker.js?worker";
import {
  AI_PLAYER,
  HUMAN_PLAYER,
  initializeGameBoard,
  cloneGameboard,
  playMove,
  checkIfGameEnd,
  getLegalMoves,
  getScore,
  getWinner,
  getFlippedPieces,
  opponent,
} from "../othello";

// The AI answers in a few ms; a short pause makes its move readable
const MIN_AI_TURN_TIME = 700;
const FLIP_STAGGER = 60;

// Exactly one of these at a time. "loading" and "error" are about the AI
// worker; the human always starts, so "loading" ends in "yourTurn".
type Phase = "loading" | "error" | "yourTurn" | "aiTurn" | "over";

type Props = {
  labels: OthelloLabels;
  onReady?: () => void;
  onClose?: () => void;
};

const OthelloGame: Component<Props> = (props) => {
  const [gameboard, setGameboard] = createSignal(initializeGameBoard());
  const [phase, setPhase] = createSignal<Phase>("loading");
  const [difficulty, setDifficulty] = createSignal(1);
  const [lastMove, setLastMove] = createSignal<LastMove | null>(null);
  // One-off message when a player has to pass
  const [notice, setNotice] = createSignal<string | null>(null);

  const levels = () => [props.labels.easy, props.labels.medium, props.labels.hard];
  const score = createMemo(() => getScore(gameboard()));
  const yourShare = () => (score().x / (score().x + score().o)) * 100;
  const legalMoves = createMemo(() =>
    phase() === "yourTurn" ? getLegalMoves(HUMAN_PLAYER, gameboard()) : [],
  );

  const resultText = () => {
    const winner = getWinner(gameboard());
    if (winner === "draw") return props.labels.draw;
    return winner === HUMAN_PLAYER ? props.labels.won : props.labels.lost;
  };

  const status = () => {
    switch (phase()) {
      case "loading":
        return props.labels["loading-ai"];
      case "error":
        return props.labels["ai-error"];
      case "over":
        return resultText();
      case "aiTurn":
        return notice() ?? props.labels["ai-thinking"];
      case "yourTurn":
        return notice() ?? props.labels["your-turn"];
    }
  };

  let worker: Worker | undefined;
  // Bumped on every new game so a late AI answer for an old game is ignored
  let gameId = 0;
  let aiRequestedAt = 0;
  let aiMoveTimeout: ReturnType<typeof setTimeout> | undefined;

  onMount(() => {
    worker = new AIworker();
    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;
      switch (message.type) {
        case "ready":
          if (phase() === "loading") setPhase("yourTurn");
          break;
        case "error":
          setPhase("error");
          break;
        case "move":
          if (message.gameId !== gameId) break;
          aiMoveTimeout = setTimeout(
            () => applyMove(message.move, AI_PLAYER),
            Math.max(0, MIN_AI_TURN_TIME - (Date.now() - aiRequestedAt)),
          );
      }
    };
    worker.onerror = () => setPhase("error");
    props.onReady?.();
  });

  onCleanup(() => {
    worker?.terminate();
    clearTimeout(aiMoveTimeout);
  });

  function requestAIMove(board: Gameboard) {
    aiRequestedAt = Date.now();
    const request: MoveRequest = {
      gameboard: board,
      player: AI_PLAYER,
      difficulty: difficulty(),
      gameId,
    };
    worker?.postMessage(request);
  }

  function applyMove(move: Move, player: Player) {
    const before = gameboard();
    const flips = new Map<string, number>();
    for (const piece of getFlippedPieces(move, player, before)) {
      const distance = Math.max(
        Math.abs(piece.row - move.row),
        Math.abs(piece.column - move.column),
      );
      flips.set(squareKey(piece), (distance - 1) * FLIP_STAGGER);
    }
    const after = cloneGameboard(before);
    playMove(move, player, after);

    batch(() => {
      setLastMove({ move, player, flips });
      setGameboard(after);
      nextTurn(player, after);
    });
  }

  // Hands the turn to the other player, or back if they have no legal move
  function nextTurn(justPlayed: Player, board: Gameboard) {
    if (checkIfGameEnd(board)) {
      setNotice(null);
      setPhase("over");
      return;
    }
    const other = opponent(justPlayed);
    const otherCanPlay = getLegalMoves(other, board).length > 0;
    const next = otherCanPlay ? other : justPlayed;
    if (otherCanPlay) setNotice(null);
    else setNotice(other === HUMAN_PLAYER ? props.labels["you-pass"] : props.labels["ai-passes"]);

    setPhase(next === HUMAN_PLAYER ? "yourTurn" : "aiTurn");
    if (next === AI_PLAYER) requestAIMove(board);
  }

  function playHumanMove(move: Move) {
    if (phase() === "yourTurn") applyMove(move, HUMAN_PLAYER);
  }

  function newGame() {
    gameId++;
    clearTimeout(aiMoveTimeout);
    batch(() => {
      setGameboard(initializeGameBoard());
      setLastMove(null);
      setNotice(null);
      // Before the AI is ready (or if it failed) there is no game to restart
      setPhase((p) => (p === "loading" || p === "error" ? p : "yourTurn"));
    });
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
          <div class={styles.side} data-active={phase() === "yourTurn" ? "" : undefined}>
            <span class={`${styles.dot} ${styles.dotYou}`} />
            <span class={styles.name}>{props.labels.you}</span>
            <span class={styles.count}>{score().x}</span>
          </div>
          <div class={styles.side} data-active={phase() === "aiTurn" ? "" : undefined}>
            <span class={`${styles.dot} ${styles.dotAI}`} />
            <span class={styles.name}>
              {props.labels.ai}
              <Show when={phase() === "aiTurn"}>
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
          lastMove={lastMove}
          locked={() => phase() !== "yourTurn"}
          onPlay={playHumanMove}
          labels={props.labels}
        />
        <Show when={phase() === "over"}>
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
          {props.labels["new-game"]}
        </button>
      </div>
    </div>
  );
};

export default OthelloGame;
