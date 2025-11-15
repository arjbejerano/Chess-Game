import React from 'react';
import { ChessPiece, PieceColor, PieceType } from '../types/chess';

interface ChessPieceComponentProps {
  piece: ChessPiece | null;
  size?: number;
}

const ChessPieceComponent: React.FC<ChessPieceComponentProps> = ({ piece, size = 40 }) => {
  if (!piece) return null;

  const getPieceSymbol = (type: PieceType, color: PieceColor): string => {
    const symbols = {
      white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙'
      },
      black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟'
      }
    };
    
    return symbols[color][type];
  };

  return (
    <div 
      className="flex items-center justify-center select-none"
      style={{ fontSize: `${size}px` }}
    >
      {getPieceSymbol(piece.type, piece.color)}
    </div>
  );
};

export default ChessPieceComponent;