import React from 'react';
import { Board, Position, Move } from '../types/chess';
import ChessSquare from './ChessSquare';
import { findKing } from '../utils/boardUtils';
import { isInCheck } from '../utils/chessLogic';

interface ChessBoardProps {
  board: Board;
  selectedSquare: Position | null;
  validMoves: Position[];
  currentPlayer: 'white' | 'black';
  lastMove: Move | null;
  onSquareClick: (position: Position) => void;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  selectedSquare,
  validMoves,
  currentPlayer,
  lastMove,
  onSquareClick
}) => {
  const kingInCheck = isInCheck(board, currentPlayer);
  const kingPosition = kingInCheck ? findKing(board, currentPlayer) : null;

  const isValidMove = (position: Position): boolean => {
    return validMoves.some(move => move.row === position.row && move.col === position.col);
  };

  const isLastMoveSquare = (position: Position): boolean => {
    if (!lastMove) return false;
    return (
      (lastMove.from.row === position.row && lastMove.from.col === position.col) ||
      (lastMove.to.row === position.row && lastMove.to.col === position.col)
    );
  };

  const isKingInCheck = (position: Position): boolean => {
    return kingPosition ? 
      kingPosition.row === position.row && kingPosition.col === position.col : 
      false;
  };

  return (
    <div className="inline-block border-4 border-amber-900 bg-amber-900">
      <div className="grid grid-cols-8 gap-0">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const position = { row: rowIndex, col: colIndex };
            return (
              <ChessSquare
                key={`${rowIndex}-${colIndex}`}
                position={position}
                piece={piece}
                isSelected={selectedSquare ? 
                  selectedSquare.row === rowIndex && selectedSquare.col === colIndex : 
                  false
                }
                isValidMove={isValidMove(position)}
                isLastMove={isLastMoveSquare(position)}
                isInCheck={isKingInCheck(position)}
                onClick={onSquareClick}
              />
            );
          })
        )}
      </div>
      
      {/* Board coordinates */}
      <div className="flex justify-between mt-2 px-2">
        {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(letter => (
          <div key={letter} className="w-16 text-center text-amber-100 font-semibold">
            {letter}
          </div>
        ))}
      </div>
      
      <div className="absolute left-0 top-0 flex flex-col justify-between h-full py-2 -ml-8">
        {[8, 7, 6, 5, 4, 3, 2, 1].map(number => (
          <div key={number} className="h-16 flex items-center text-amber-100 font-semibold">
            {number}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChessBoard;