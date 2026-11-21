import type { Gameboard, Move } from './othello';

const GAMEBOARD_SIZE = 8;

function copyArray(src: Int8Array, dest: Int8Array): void {
  for (let i = 0; i < src.length; i++) {
    dest[i] = src[i];
  }
}

function convertAImoveToMove(AImove: number): Move{
  const row = Math.floor(AImove / GAMEBOARD_SIZE);
  const column = AImove % GAMEBOARD_SIZE;
  const move = { row, column };
  return move;
}

function convertGameboardToArray(gameboard: Gameboard) {
  const gameboardArray = new Int8Array(GAMEBOARD_SIZE * GAMEBOARD_SIZE);
  for (let i = 0; i < GAMEBOARD_SIZE; i++) {
    for (let j = 0; j < GAMEBOARD_SIZE; j++) {
      gameboardArray[i * GAMEBOARD_SIZE + j] = gameboard[i][j].charCodeAt(0);
    }
  }
  return gameboardArray;
}

type MoveRequest = {
  gameboard: Gameboard;
  player: string;
  difficulty: number;
  gameId: number;
};

// Messages sent back to the UI:
//   { type: 'ready' }                 once the WASM module is instantiated
//   { type: 'error' }                 if it can't be loaded
//   { type: 'move', move, gameId }    answer to a request (gameId lets the UI
//                                      ignore answers for a game it has reset)
WebAssembly.instantiateStreaming(fetch(new URL('./othelloAI.wasm', import.meta.url).href), {})
  .then((obj) => {
    const getAImove = obj.instance.exports.getAImove as CallableFunction;
    const WASMmemory = obj.instance.exports.memory as WebAssembly.Memory;

    function generateAImove(gameboard: Gameboard, player: string, difficulty: number): Move {
      const arrayGameboardMemory = new Int8Array(WASMmemory.buffer);
      copyArray(convertGameboardToArray(gameboard), arrayGameboardMemory);
      const result = getAImove(arrayGameboardMemory, player.charCodeAt(0), difficulty);
      return convertAImoveToMove(result);
    }

    self.onmessage = (event: MessageEvent<MoveRequest>) => {
      const { gameboard, player, difficulty, gameId } = event.data;
      const move = generateAImove(gameboard, player, difficulty);
      self.postMessage({ type: 'move', move, gameId });
    };

    // The UI keeps the board locked until this arrives, so no request is
    // ever sent before onmessage exists (it would be silently dropped)
    self.postMessage({ type: 'ready' });
  })
  .catch(() => self.postMessage({ type: 'error' }));
