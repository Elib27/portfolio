import { GAMEBOARD_SIZE } from './othello';
import type { Gameboard, Move, Player } from './othello';
import type { MoveRequest, WorkerMessage } from './messages';

const BOARD_BYTES = GAMEBOARD_SIZE * GAMEBOARD_SIZE;

// Exports of othelloAI.wasm (C compiled with Emscripten)
type AIExports = {
  memory: WebAssembly.Memory;
  // Takes a pointer to 64 bytes (one char per square, row by row),
  // returns the chosen square as row * 8 + column
  getAImove: (boardPointer: number, player: number, difficulty: number) => number;
  stackSave: () => number;
  stackAlloc: (size: number) => number;
  stackRestore: (pointer: number) => void;
};

const send = (message: WorkerMessage) => self.postMessage(message);

function createAI(ai: AIExports) {
  return function getAIMove(gameboard: Gameboard, player: Player, difficulty: number): Move {
    // Borrow 64 bytes on the WASM stack for the board, then give them back
    const stack = ai.stackSave();
    try {
      const pointer = ai.stackAlloc(BOARD_BYTES);
      const board = new Int8Array(ai.memory.buffer, pointer, BOARD_BYTES);
      gameboard.flat().forEach((cell, i) => (board[i] = cell.charCodeAt(0)));
      const square = ai.getAImove(pointer, player.charCodeAt(0), difficulty);
      return { row: Math.floor(square / GAMEBOARD_SIZE), column: square % GAMEBOARD_SIZE };
    } finally {
      ai.stackRestore(stack);
    }
  };
}

WebAssembly.instantiateStreaming(fetch(new URL('./othelloAI.wasm', import.meta.url).href), {})
  .then(({ instance }) => {
    const getAIMove = createAI(instance.exports as unknown as AIExports);

    self.onmessage = (event: MessageEvent<MoveRequest>) => {
      const { gameboard, player, difficulty, gameId } = event.data;
      send({ type: 'move', move: getAIMove(gameboard, player, difficulty), gameId });
    };

    // The UI keeps the board locked until this arrives, so no request is
    // ever sent before onmessage exists (it would be silently dropped)
    send({ type: 'ready' });
  })
  .catch(() => send({ type: 'error' }));
