import type { Accessor, Component } from "solid-js";
import { createMemo, createSignal, For, Show } from "solid-js";
import type { Gameboard, Move } from "../othello";
import type { OthelloLabels } from "../labels";
import { getFlippedPieces } from "../othello";
import styles from "./GameboardUI.module.css";

const HUMAN = "x";
const COLUMNS = "ABCDEFGH";
const SQUARES = Array.from({ length: 64 }, (_, i) => i);
// The four dots of a real Othello board, at the corners of the central 4×4
const STAR_POINTS = [
  ["25%", "25%"],
  ["75%", "25%"],
  ["25%", "75%"],
  ["75%", "75%"],
];

const key = (move: Move) => `${move.row},${move.column}`;

interface Props {
  gameboard: Accessor<Gameboard>;
  legalMoves: Accessor<Move[]>;
  // True while the AI is loading or thinking, or the game is over
  locked: Accessor<boolean>;
  lastAIMove: Accessor<Move | null>;
  // Pieces being flipped right now, with their animation delay in ms
  flips: Accessor<Map<string, number>>;
  placedCell: Accessor<string | null>;
  onPlay: (move: Move) => void;
  labels: OthelloLabels;
}

const GameboardUI: Component<Props> = (props) => {
  const [hovered, setHovered] = createSignal<Move | null>(null);

  const legalSet = createMemo(
    () => new Set(props.locked() ? [] : props.legalMoves().map(key)),
  );

  // Pieces the hovered/focused move would flip, highlighted as a preview
  const preview = createMemo(() => {
    const move = hovered();
    if (!move || !legalSet().has(key(move))) return new Set<string>();
    return new Set(
      getFlippedPieces(move, HUMAN, props.gameboard()).map(key),
    );
  });

  return (
    <div class={styles.frame} classList={{ [styles.locked]: props.locked() }}>
      <div class={styles.grid} role="group" aria-label={props.labels.board}>
        <For each={SQUARES}>
          {(index) => {
            const move = { row: Math.floor(index / 8), column: index % 8 };
            const id = key(move);
            const value = () => props.gameboard()[move.row][move.column];
            const isLegal = () => legalSet().has(id);
            const isPiece = () => value() === "x" || value() === "o";
            const isLastAIMove = () => {
              const last = props.lastAIMove();
              return !!last && key(last) === id;
            };
            const flipDelay = () => props.flips().get(id);

            const description = () => {
              if (value() === "x") return props.labels.yourPiece;
              if (value() === "o") return props.labels.aiPiece;
              if (isLegal()) return props.labels.legalMove;
              return props.labels.emptySquare;
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
                <Show when={isPiece()}>
                  <span
                    class={styles.piece}
                    classList={{
                      [styles.you]: value() === "x",
                      [styles.ai]: value() === "o",
                      [styles.placing]: props.placedCell() === id,
                      [styles.flipToYou]:
                        flipDelay() !== undefined && value() === "x",
                      [styles.flipToAi]:
                        flipDelay() !== undefined && value() === "o",
                      [styles.lastMove]: isLastAIMove(),
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
