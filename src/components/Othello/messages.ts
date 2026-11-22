import type { Gameboard, Move, Player } from './othello';

// Messages between the game UI and the AI worker (AIworker.ts)

export type MoveRequest = {
  gameboard: Gameboard;
  player: Player;
  difficulty: number;
  // Echoed back so the UI can ignore answers for a game it has since reset
  gameId: number;
};

export type WorkerMessage =
  | { type: 'ready' } // WASM instantiated, requests can be sent
  | { type: 'error' } // WASM failed to load
  | { type: 'move'; move: Move; gameId: number };
