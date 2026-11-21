// Othello rules: pure functions over an 8×8 board, no UI state.

export type Player = 'x' | 'o';
export type Cell = Player | ' ';
export type Gameboard = Cell[][];

export type Move = {
  row: number;
  column: number;
};

type Score = Record<Player, number>;

export const HUMAN_PLAYER: Player = 'x';
export const AI_PLAYER: Player = 'o';

export const GAMEBOARD_SIZE = 8;

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
] as const;

export function opponent(player: Player): Player {
  return player === 'x' ? 'o' : 'x';
}

export function initializeGameBoard(): Gameboard {
  const gameboard: Gameboard = Array.from({ length: GAMEBOARD_SIZE }, () =>
    Array<Cell>(GAMEBOARD_SIZE).fill(' '),
  );
  gameboard[3][3] = 'o';
  gameboard[3][4] = 'x';
  gameboard[4][3] = 'x';
  gameboard[4][4] = 'o';
  return gameboard;
}

export function cloneGameboard(gameboard: Gameboard): Gameboard {
  return gameboard.map((row) => [...row]);
}

function isOnBoard(row: number, column: number): boolean {
  return row >= 0 && row < GAMEBOARD_SIZE && column >= 0 && column < GAMEBOARD_SIZE;
}

// Opponent pieces that `player` would turn over by playing `move`.
// Empty when the move is illegal.
export function getFlippedPieces(move: Move, player: Player, gameboard: Gameboard): Move[] {
  if (gameboard[move.row][move.column] !== ' ') return [];
  const adversary = opponent(player);
  const flipped: Move[] = [];
  for (const [dRow, dColumn] of DIRECTIONS) {
    const line: Move[] = [];
    let row = move.row + dRow;
    let column = move.column + dColumn;
    while (isOnBoard(row, column) && gameboard[row][column] === adversary) {
      line.push({ row, column });
      row += dRow;
      column += dColumn;
    }
    // A line only flips if it is closed by one of the player's own pieces
    if (line.length > 0 && isOnBoard(row, column) && gameboard[row][column] === player)
      flipped.push(...line);
  }
  return flipped;
}

export function getLegalMoves(player: Player, gameboard: Gameboard): Move[] {
  const legalMoves: Move[] = [];
  for (let row = 0; row < GAMEBOARD_SIZE; row++) {
    for (let column = 0; column < GAMEBOARD_SIZE; column++) {
      const move = { row, column };
      if (getFlippedPieces(move, player, gameboard).length > 0) legalMoves.push(move);
    }
  }
  return legalMoves;
}

// Plays a legal move in place
export function playMove(move: Move, player: Player, gameboard: Gameboard): void {
  for (const piece of getFlippedPieces(move, player, gameboard))
    gameboard[piece.row][piece.column] = player;
  gameboard[move.row][move.column] = player;
}

export function checkIfGameEnd(gameboard: Gameboard): boolean {
  return (
    getLegalMoves('x', gameboard).length === 0 &&
    getLegalMoves('o', gameboard).length === 0
  );
}

export function getScore(gameboard: Gameboard): Score {
  const score: Score = { x: 0, o: 0 };
  for (const row of gameboard)
    for (const cell of row) if (cell !== ' ') score[cell]++;
  return score;
}

export function getWinner(gameboard: Gameboard): Player | 'draw' {
  const { x, o } = getScore(gameboard);
  if (x > o) return 'x';
  if (x < o) return 'o';
  return 'draw';
}
