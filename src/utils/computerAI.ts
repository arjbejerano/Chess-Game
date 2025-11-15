import { Board, PieceColor, Position, ComputerDifficulty } from '../types/chess';
import { getAllValidMoves, makeMove, isCheckmate, isInCheck } from './chessLogic';
import { getPieceAt } from './boardUtils';

export const computerDifficulties: ComputerDifficulty[] = [
  { name: 'Easy', depth: 1, randomness: 0.3 },
  { name: 'Medium', depth: 2, randomness: 0.2 },
  { name: 'Hard', depth: 3, randomness: 0.1 }
];

export const getComputerMove = (
  board: Board, 
  color: PieceColor, 
  difficulty: ComputerDifficulty
): { from: Position; to: Position } | null => {
  const allMoves = getAllValidMoves(board, color);
  
  if (allMoves.length === 0) return null;

  // For easy difficulty, sometimes make random moves
  if (Math.random() < difficulty.randomness) {
    return allMoves[Math.floor(Math.random() * allMoves.length)];
  }

  // Use minimax algorithm for better moves
  const bestMove = minimax(board, difficulty.depth, color, true, -Infinity, Infinity);
  
  if (bestMove.move) {
    return bestMove.move;
  }

  // Fallback to random move
  return allMoves[Math.floor(Math.random() * allMoves.length)];
};

interface MinimaxResult {
  score: number;
  move: { from: Position; to: Position } | null;
}

const minimax = (
  board: Board,
  depth: number,
  color: PieceColor,
  isMaximizing: boolean,
  alpha: number,
  beta: number
): MinimaxResult => {
  if (depth === 0) {
    return { score: evaluateBoard(board, color), move: null };
  }

  const moves = getAllValidMoves(board, isMaximizing ? color : (color === 'white' ? 'black' : 'white'));
  
  if (moves.length === 0) {
    const currentColor = isMaximizing ? color : (color === 'white' ? 'black' : 'white');
    if (isCheckmate(board, currentColor)) {
      return { score: isMaximizing ? -10000 : 10000, move: null };
    }
    return { score: 0, move: null }; // Stalemate
  }

  let bestMove: { from: Position; to: Position } | null = null;

  if (isMaximizing) {
    let maxScore = -Infinity;
    
    for (const move of moves) {
      const { newBoard } = makeMove(board, move.from, move.to);
      const result = minimax(newBoard, depth - 1, color, false, alpha, beta);
      
      if (result.score > maxScore) {
        maxScore = result.score;
        bestMove = move;
      }
      
      alpha = Math.max(alpha, result.score);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    
    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;
    
    for (const move of moves) {
      const { newBoard } = makeMove(board, move.from, move.to);
      const result = minimax(newBoard, depth - 1, color, true, alpha, beta);
      
      if (result.score < minScore) {
        minScore = result.score;
        bestMove = move;
      }
      
      beta = Math.min(beta, result.score);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    
    return { score: minScore, move: bestMove };
  }
};

const evaluateBoard = (board: Board, color: PieceColor): number => {
  let score = 0;
  
  const pieceValues = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 0
  };

  // Material evaluation
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = getPieceAt(board, { row, col });
      if (piece) {
        const value = pieceValues[piece.type];
        if (piece.color === color) {
          score += value;
        } else {
          score -= value;
        }
      }
    }
  }

  // Positional bonuses
  score += getPositionalScore(board, color);

  // Check penalty
  if (isInCheck(board, color)) {
    score -= 0.5;
  }
  if (isInCheck(board, color === 'white' ? 'black' : 'white')) {
    score += 0.5;
  }

  return score;
};

const getPositionalScore = (board: Board, color: PieceColor): number => {
  let score = 0;
  
  // Center control bonus
  const centerSquares = [
    { row: 3, col: 3 }, { row: 3, col: 4 },
    { row: 4, col: 3 }, { row: 4, col: 4 }
  ];
  
  centerSquares.forEach(pos => {
    const piece = getPieceAt(board, pos);
    if (piece) {
      if (piece.color === color) {
        score += 0.3;
      } else {
        score -= 0.3;
      }
    }
  });

  // Pawn structure bonus
  for (let col = 0; col < 8; col++) {
    let whitePawns = 0;
    let blackPawns = 0;
    
    for (let row = 0; row < 8; row++) {
      const piece = getPieceAt(board, { row, col });
      if (piece && piece.type === 'pawn') {
        if (piece.color === 'white') whitePawns++;
        else blackPawns++;
      }
    }
    
    // Doubled pawns penalty
    if (color === 'white' && whitePawns > 1) score -= 0.2 * (whitePawns - 1);
    if (color === 'black' && blackPawns > 1) score += 0.2 * (blackPawns - 1);
  }

  return score;
};