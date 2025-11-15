import { Board, ChessPiece, Position, PieceColor, Move } from '../types/chess';
import { isValidPosition, getPieceAt, setPieceAt, findKing, copyBoard } from './boardUtils';

export const getValidMoves = (board: Board, from: Position): Position[] => {
  const piece = getPieceAt(board, from);
  if (!piece) return [];

  let moves: Position[] = [];

  switch (piece.type) {
    case 'pawn':
      moves = getPawnMoves(board, from, piece.color);
      break;
    case 'rook':
      moves = getRookMoves(board, from, piece.color);
      break;
    case 'knight':
      moves = getKnightMoves(board, from, piece.color);
      break;
    case 'bishop':
      moves = getBishopMoves(board, from, piece.color);
      break;
    case 'queen':
      moves = getQueenMoves(board, from, piece.color);
      break;
    case 'king':
      moves = getKingMoves(board, from, piece.color);
      break;
  }

  // Filter out moves that would put own king in check
  return moves.filter(to => !wouldBeInCheck(board, from, to, piece.color));
};

const getPawnMoves = (board: Board, from: Position, color: PieceColor): Position[] => {
  const moves: Position[] = [];
  const direction = color === 'white' ? -1 : 1;
  const startRow = color === 'white' ? 6 : 1;

  // Forward move
  const oneStep = { row: from.row + direction, col: from.col };
  if (isValidPosition(oneStep) && !getPieceAt(board, oneStep)) {
    moves.push(oneStep);

    // Two steps from starting position
    if (from.row === startRow) {
      const twoSteps = { row: from.row + 2 * direction, col: from.col };
      if (isValidPosition(twoSteps) && !getPieceAt(board, twoSteps)) {
        moves.push(twoSteps);
      }
    }
  }

  // Diagonal captures
  const captureLeft = { row: from.row + direction, col: from.col - 1 };
  const captureRight = { row: from.row + direction, col: from.col + 1 };

  [captureLeft, captureRight].forEach(pos => {
    if (isValidPosition(pos)) {
      const targetPiece = getPieceAt(board, pos);
      if (targetPiece && targetPiece.color !== color) {
        moves.push(pos);
      }
    }
  });

  return moves;
};

const getRookMoves = (board: Board, from: Position, color: PieceColor): Position[] => {
  const moves: Position[] = [];
  const directions = [
    { row: 0, col: 1 },   // right
    { row: 0, col: -1 },  // left
    { row: 1, col: 0 },   // down
    { row: -1, col: 0 }   // up
  ];

  directions.forEach(dir => {
    for (let i = 1; i < 8; i++) {
      const pos = { row: from.row + dir.row * i, col: from.col + dir.col * i };
      if (!isValidPosition(pos)) break;

      const piece = getPieceAt(board, pos);
      if (!piece) {
        moves.push(pos);
      } else {
        if (piece.color !== color) {
          moves.push(pos);
        }
        break;
      }
    }
  });

  return moves;
};

const getKnightMoves = (board: Board, from: Position, color: PieceColor): Position[] => {
  const moves: Position[] = [];
  const knightMoves = [
    { row: -2, col: -1 }, { row: -2, col: 1 },
    { row: -1, col: -2 }, { row: -1, col: 2 },
    { row: 1, col: -2 }, { row: 1, col: 2 },
    { row: 2, col: -1 }, { row: 2, col: 1 }
  ];

  knightMoves.forEach(move => {
    const pos = { row: from.row + move.row, col: from.col + move.col };
    if (isValidPosition(pos)) {
      const piece = getPieceAt(board, pos);
      if (!piece || piece.color !== color) {
        moves.push(pos);
      }
    }
  });

  return moves;
};

const getBishopMoves = (board: Board, from: Position, color: PieceColor): Position[] => {
  const moves: Position[] = [];
  const directions = [
    { row: 1, col: 1 },   // down-right
    { row: 1, col: -1 },  // down-left
    { row: -1, col: 1 },  // up-right
    { row: -1, col: -1 }  // up-left
  ];

  directions.forEach(dir => {
    for (let i = 1; i < 8; i++) {
      const pos = { row: from.row + dir.row * i, col: from.col + dir.col * i };
      if (!isValidPosition(pos)) break;

      const piece = getPieceAt(board, pos);
      if (!piece) {
        moves.push(pos);
      } else {
        if (piece.color !== color) {
          moves.push(pos);
        }
        break;
      }
    }
  });

  return moves;
};

const getQueenMoves = (board: Board, from: Position, color: PieceColor): Position[] => {
  return [...getRookMoves(board, from, color), ...getBishopMoves(board, from, color)];
};

const getKingMoves = (board: Board, from: Position, color: PieceColor): Position[] => {
  const moves: Position[] = [];
  const kingMoves = [
    { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
    { row: 0, col: -1 },                       { row: 0, col: 1 },
    { row: 1, col: -1 }, { row: 1, col: 0 }, { row: 1, col: 1 }
  ];

  kingMoves.forEach(move => {
    const pos = { row: from.row + move.row, col: from.col + move.col };
    if (isValidPosition(pos)) {
      const piece = getPieceAt(board, pos);
      if (!piece || piece.color !== color) {
        moves.push(pos);
      }
    }
  });

  return moves;
};

export const isInCheck = (board: Board, color: PieceColor): boolean => {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  const opponentColor = color === 'white' ? 'black' : 'white';

  // Check if any opponent piece can attack the king
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === opponentColor) {
        const moves = getValidMovesWithoutCheckValidation(board, { row, col });
        if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
          return true;
        }
      }
    }
  }

  return false;
};

const getValidMovesWithoutCheckValidation = (board: Board, from: Position): Position[] => {
  const piece = getPieceAt(board, from);
  if (!piece) return [];

  switch (piece.type) {
    case 'pawn':
      return getPawnMoves(board, from, piece.color);
    case 'rook':
      return getRookMoves(board, from, piece.color);
    case 'knight':
      return getKnightMoves(board, from, piece.color);
    case 'bishop':
      return getBishopMoves(board, from, piece.color);
    case 'queen':
      return getQueenMoves(board, from, piece.color);
    case 'king':
      return getKingMoves(board, from, piece.color);
    default:
      return [];
  }
};

const wouldBeInCheck = (board: Board, from: Position, to: Position, color: PieceColor): boolean => {
  // Simulate the move
  const newBoard = copyBoard(board);
  const piece = getPieceAt(newBoard, from);
  if (!piece) return false;

  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;

  return isInCheck(newBoard, color);
};

export const makeMove = (board: Board, from: Position, to: Position): { newBoard: Board; move: Move } => {
  const piece = getPieceAt(board, from);
  if (!piece) throw new Error('No piece at source position');

  const capturedPiece = getPieceAt(board, to);
  const newBoard = copyBoard(board);

  // Move the piece
  newBoard[to.row][to.col] = { ...piece, hasMoved: true };
  newBoard[from.row][from.col] = null;

  const move: Move = {
    from,
    to,
    piece,
    capturedPiece: capturedPiece || undefined
  };

  return { newBoard, move };
};

export const getAllValidMoves = (board: Board, color: PieceColor): { from: Position; to: Position }[] => {
  const allMoves: { from: Position; to: Position }[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const from = { row, col };
        const validMoves = getValidMoves(board, from);
        validMoves.forEach(to => {
          allMoves.push({ from, to });
        });
      }
    }
  }

  return allMoves;
};

export const isCheckmate = (board: Board, color: PieceColor): boolean => {
  if (!isInCheck(board, color)) return false;
  return getAllValidMoves(board, color).length === 0;
};

export const isStalemate = (board: Board, color: PieceColor): boolean => {
  if (isInCheck(board, color)) return false;
  return getAllValidMoves(board, color).length === 0;
};