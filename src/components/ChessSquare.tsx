import React from 'react';
import { Position } from '../types/chess';
import { cn } from '../lib/utils';
import ChessPieceComponent from './ChessPiece';
import { ChessPiece } from '../types/chess';

interface ChessSquareProps {
  position: Position;
  piece: ChessPiece | null;
  isSelected: boolean;
  isValidMove: boolean;
  isLastMove: boolean;
  isInCheck: boolean;
  onClick: (position: Position) => void;
}

const ChessSquare: React.FC<ChessSquareProps> = ({
  position,
  piece,
  isSelected,
  isValidMove,
  isLastMove,
  isInCheck,
  onClick
}) => {
  const isLight = (position.row + position.col) % 2 === 0;
  
  const handleClick = () => {
    onClick(position);
  };

  return (
    <div
      className={cn(
        "w-16 h-16 flex items-center justify-center cursor-pointer relative transition-all duration-200 hover:brightness-110",
        isLight ? "bg-amber-100" : "bg-amber-800",
        isSelected && "ring-4 ring-blue-500 ring-inset",
        isLastMove && "ring-2 ring-yellow-400 ring-inset",
        isInCheck && piece?.type === 'king' && "bg-red-500"
      )}
      onClick={handleClick}
    >
      <ChessPieceComponent piece={piece} size={48} />
      
      {isValidMove && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          piece ? "bg-red-500/30" : "bg-green-500/30"
        )}>
          {!piece && (
            <div className="w-4 h-4 bg-green-600 rounded-full" />
          )}
        </div>
      )}
    </div>
  );
};

export default ChessSquare;