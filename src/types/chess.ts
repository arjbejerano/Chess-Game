export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: ChessPiece;
  capturedPiece?: ChessPiece;
  isEnPassant?: boolean;
  isCastling?: boolean;
  promotion?: PieceType;
}

export type Board = (ChessPiece | null)[][];

export interface GameState {
  board: Board;
  currentPlayer: PieceColor;
  selectedSquare: Position | null;
  validMoves: Position[];
  gameStatus: 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw';
  moveHistory: Move[];
  isComputerThinking: boolean;
}

export interface ComputerDifficulty {
  name: string;
  depth: number;
  randomness: number;
}