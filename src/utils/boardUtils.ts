import { Board, ChessPiece, Position, PieceColor, PieceType } from '../types/chess';

export const createInitialBoard = (): Board => {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Place pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: 'pawn', color: 'black' };
    board[6][col] = { type: 'pawn', color: 'white' };
  }
  
  // Place other pieces
  const pieceOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: pieceOrder[col], color: 'black' };
    board[7][col] = { type: pieceOrder[col], color: 'white' };
  }
  
  return board;
};

export const isValidPosition = (pos: Position): boolean => {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
};

export const getPieceAt = (board: Board, pos: Position): ChessPiece | null => {
  if (!isValidPosition(pos)) return null;
  return board[pos.row][pos.col];
};

export const setPieceAt = (board: Board, pos: Position, piece: ChessPiece | null): Board => {
  const newBoard = board.map(row => [...row]);
  if (isValidPosition(pos)) {
    newBoard[pos.row][pos.col] = piece;
  }
  return newBoard;
};

export const isSamePosition = (pos1: Position, pos2: Position): boolean => {
  return pos1.row === pos2.row && pos1.col === pos2.col;
};

export const getPositionKey = (pos: Position): string => {
  return `${pos.row}-${pos.col}`;
};

export const findKing = (board: Board, color: PieceColor): Position | null => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
};

export const getAllPieces = (board: Board, color: PieceColor): { piece: ChessPiece; position: Position }[] => {
  const pieces: { piece: ChessPiece; position: Position }[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        pieces.push({ piece, position: { row, col } });
      }
    }
  }
  return pieces;
};

export const copyBoard = (board: Board): Board => {
  return board.map(row => row.map(piece => piece ? { ...piece } : null));
};