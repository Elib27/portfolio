import type { Accessor, Component } from "solid-js";
import { createMemo, createSignal, For, Show } from "solid-js";
import type { Gameboard, Move, Player } from "../othello";
import type { OthelloLabels } from "../labels";
import { AI_PLAYER, GAMEBOARD_SIZE, getFlippedPieces, HUMAN_PLAYER } from "../othello";
import styles from "./GameboardUI.module.css";

// The move just played, kept until the next one. Its animations (placed
// piece, flips) run once when their class appears, so nothing needs clearing.
export type LastMove = {
  move: Move;
  player: Player;
  // Flipped pieces → animation delay in ms (flips ripple out from the move)
  flips: Map<string, number>;
};

const COLUMNS = "ABCDEFGH";
const SQUARES = Array.from({ length: GAMEBOARD_SIZE ** 2 }, (_, i) => i);
// The four dots of a real Othello board, at the corners of the central 4×4
const STAR_POINTS = [
  ["25%", "25%"],
  ["75%", "25%"],
  ["25%", "75%"],
  ["75%", "75%"],
];

export const squareKey = (move: Move) => `${move.row},${move.column}`;

interface Props {
  gameboard: Accessor<Gameboard>;
  legalMoves: Accessor<Move[]>;
  lastMove: Accessor<LastMove | null>;
  // True whenever it isn't the human's turn (AI loading or thinking, game over)
  locked: Accessor<boolean>;
  onPlay: (move: Move) => void;
  labels: OthelloLabels;
}

const GameboardUI: Component<Props> = (props) => {
  const [hovered, setHovered] = createSignal<Move | null>(null);

  const legalSet = createMemo(() => new Set(props.legalMoves().map(squareKey)));

  // Pieces the hovered/focused move would flip, highlighted as a preview
  const preview = createMemo(() => {
    const move = hovered();
    if (!move || !legalSet().has(squareKey(move))) return new Set<string>();
    return new Set(
      getFlippedPieces(move, HUMAN_PLAYER, props.gameboard()).map(squareKey),
    );
  });

  return (
    <div class={styles.frame} classList={{ [styles.locked]: props.locked() }}>
      <div class={styles.grid} role="group" aria-label={props.labels.board}>
        <For each={SQUARES}>
          {(index) => {
            const move = {
              row: Math.floor(index / GAMEBOARD_SIZE),
              column: index % GAMEBOARD_SIZE,
            };
            const id = squareKey(move);
            const cell = () => props.gameboard()[move.row][move.column];
            const isLegal = () => legalSet().has(id);
            const isLastMove = () => {
              const last = props.lastMove();
              return !!last && squareKey(last.move) === id;
            };
            const flipDelay = () => props.lastMove()?.flips.get(id);

            const description = () => {
              if (cell() === HUMAN_PLAYER) return props.labels["your-piece"];
              if (cell() === AI_PLAYER) return props.labels["ai-piece"];
              if (isLegal()) return props.labels["legal-move"];
              return props.labels["empty-square"];
            };

            return (
              <button
                type="button"
                class={styles.square}
                classList={{ [styles.legal]: isLegal() }}
                disabled={!isLegal()}
                aria-label={`${COLUMNS[move.column]}${move.row + 1}, ${description()}`}
                onClick={() => props.onPlay(move)}
                onPointerEnter={() => setHovered(move)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(move)}
                onBlur={() => setHovered(null)}
              >
                <Show when={isLegal()}>
                  <span class={styles.hint} />
                </Show>
                <Show when={cell() !== " "}>
                  <span
                    class={styles.piece}
                    classList={{
                      [styles.you]: cell() === HUMAN_PLAYER,
                      [styles.ai]: cell() === AI_PLAYER,
                      [styles.placing]: isLastMove(),
                      [styles.flipToYou]:
                        flipDelay() !== undefined && cell() === HUMAN_PLAYER,
                      [styles.flipToAi]:
                        flipDelay() !== undefined && cell() === AI_PLAYER,
                      [styles.lastAIMove]:
                        isLastMove() && props.lastMove()?.player === AI_PLAYER,
                      [styles.willFlip]: preview().has(id),
                    }}
                    style={{
                      "animation-delay":
                        flipDelay() !== undefined ? `${flipDelay()}ms` : undefined,
                    }}
                  />
                </Show>
              </button>
            );
          }}
        </For>
        <For each={STAR_POINTS}>
          {([left, top]) => (
            <span class={styles.star} style={{ left, top }} aria-hidden="true" />
          )}
        </For>
      </div>
    </div>
  );
};

export default GameboardUI;
