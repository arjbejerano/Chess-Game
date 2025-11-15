import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Position, ComputerDifficulty } from '../types/chess';
import { createInitialBoard, isSamePosition } from '../utils/boardUtils';
import { getValidMoves, makeMove, isInCheck, isCheckmate, isStalemate } from '../utils/chessLogic';
import { getComputerMove, computerDifficulties } from '../utils/computerAI';
import ChessBoard from '../components/ChessBoard';
import GameInfo from '../components/GameInfo';
import { useToast } from '../hooks/use-toast';

const ChessGame: React.FC = () => {
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: createInitialBoard(),
    currentPlayer: 'white',
    selectedSquare: null,
    validMoves: [],
    gameStatus: 'playing',
    moveHistory: [],
    isComputerThinking: false
  }));

  const [difficulty, setDifficulty] = useState<ComputerDifficulty>(computerDifficulties[1]); // Medium
  const [gameHistory, setGameHistory] = useState<GameState[]>([]);

  const updateGameStatus = useCallback((board: any, currentPlayer: 'white' | 'black') => {
    if (isCheckmate(board, currentPlayer)) {
      return 'checkmate';
    } else if (isStalemate(board, currentPlayer)) {
      return 'stalemate';
    } else if (isInCheck(board, currentPlayer)) {
      return 'check';
    }
    return 'playing';
  }, []);

  const makePlayerMove = useCallback((from: Position, to: Position) => {
    setGameState(prevState => {
      try {
        const { newBoard, move } = makeMove(prevState.board, from, to);
        const newPlayer = prevState.currentPlayer === 'white' ? 'black' : 'white';
        const newStatus = updateGameStatus(newBoard, newPlayer);
        
        const newGameState = {
          ...prevState,
          board: newBoard,
          currentPlayer: newPlayer,
          selectedSquare: null,
          validMoves: [],
          gameStatus: newStatus,
          moveHistory: [...prevState.moveHistory, move]
        };

        // Save state for undo
        setGameHistory(prev => [...prev, prevState]);

        return newGameState;
      } catch (error) {
        toast({
          title: "Invalid Move",
          description: "That move is not allowed.",
          variant: "destructive"
        });
        return prevState;
      }
    });
  }, [updateGameStatus, toast]);

  const makeComputerMove = useCallback(async () => {
    setGameState(prevState => ({ ...prevState, isComputerThinking: true }));
    
    // Add delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    setGameState(prevState => {
      if (prevState.currentPlayer !== 'black' || prevState.gameStatus !== 'playing' && prevState.gameStatus !== 'check') {
        return { ...prevState, isComputerThinking: false };
      }

      const computerMove = getComputerMove(prevState.board, 'black', difficulty);
      
      if (!computerMove) {
        return { ...prevState, isComputerThinking: false };
      }

      try {
        const { newBoard, move } = makeMove(prevState.board, computerMove.from, computerMove.to);
        const newStatus = updateGameStatus(newBoard, 'white');
        
        const newGameState = {
          ...prevState,
          board: newBoard,
          currentPlayer: 'white' as const,
          selectedSquare: null,
          validMoves: [],
          gameStatus: newStatus,
          moveHistory: [...prevState.moveHistory, move],
          isComputerThinking: false
        };

        // Save state for undo
        setGameHistory(prev => [...prev, prevState]);

        return newGameState;
      } catch (error) {
        console.error('Computer move error:', error);
        return { ...prevState, isComputerThinking: false };
      }
    });
  }, [difficulty, updateGameStatus]);

  // Handle computer moves
  useEffect(() => {
    if (gameState.currentPlayer === 'black' && 
        (gameState.gameStatus === 'playing' || gameState.gameStatus === 'check') && 
        !gameState.isComputerThinking) {
      makeComputerMove();
    }
  }, [gameState.currentPlayer, gameState.gameStatus, gameState.isComputerThinking, makeComputerMove]);

  const handleSquareClick = (position: Position) => {
    if (gameState.isComputerThinking || gameState.currentPlayer !== 'white') return;
    if (gameState.gameStatus === 'checkmate' || gameState.gameStatus === 'stalemate') return;

    // If clicking on a valid move square
    if (gameState.selectedSquare && 
        gameState.validMoves.some(move => isSamePosition(move, position))) {
      makePlayerMove(gameState.selectedSquare, position);
      return;
    }

    // If clicking on own piece
    const piece = gameState.board[position.row][position.col];
    if (piece && piece.color === 'white') {
      const validMoves = getValidMoves(gameState.board, position);
      setGameState(prevState => ({
        ...prevState,
        selectedSquare: position,
        validMoves
      }));
      return;
    }

    // Deselect
    setGameState(prevState => ({
      ...prevState,
      selectedSquare: null,
      validMoves: []
    }));
  };

  const handleNewGame = () => {
    setGameState({
      board: createInitialBoard(),
      currentPlayer: 'white',
      selectedSquare: null,
      validMoves: [],
      gameStatus: 'playing',
      moveHistory: [],
      isComputerThinking: false
    });
    setGameHistory([]);
    
    toast({
      title: "New Game Started",
      description: "Good luck against the computer!"
    });
  };

  const handleUndo = () => {
    if (gameHistory.length === 0 || gameState.isComputerThinking) return;

    // Undo last two moves (player + computer) if possible
    const statesToUndo = gameState.currentPlayer === 'white' ? 2 : 1;
    const newHistoryLength = Math.max(0, gameHistory.length - statesToUndo + 1);
    
    if (newHistoryLength > 0) {
      const previousState = gameHistory[newHistoryLength - 1];
      setGameState(previousState);
      setGameHistory(prev => prev.slice(0, newHistoryLength - 1));
    } else {
      handleNewGame();
    }
  };

  const handleDifficultyChange = (newDifficulty: ComputerDifficulty) => {
    setDifficulty(newDifficulty);
    toast({
      title: "Difficulty Changed",
      description: `Computer difficulty set to ${newDifficulty.name}`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">Chess Battle</h1>
          <p className="text-amber-700">Challenge the computer in this classic game of strategy</p>
        </div>
        
        <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
          <div className="relative">
            <ChessBoard
              board={gameState.board}
              selectedSquare={gameState.selectedSquare}
              validMoves={gameState.validMoves}
              currentPlayer={gameState.currentPlayer}
              lastMove={gameState.moveHistory[gameState.moveHistory.length - 1] || null}
              onSquareClick={handleSquareClick}
            />
          </div>
          
          <GameInfo
            gameState={gameState}
            difficulty={difficulty}
            onDifficultyChange={handleDifficultyChange}
            onNewGame={handleNewGame}
            onUndo={handleUndo}
            canUndo={gameHistory.length > 0}
          />
        </div>
        
        <div className="mt-8 text-center text-sm text-amber-600">
          <p>Click on a piece to select it, then click on a highlighted square to move.</p>
          <p>You play as White pieces. The computer plays as Black pieces.</p>
        </div>
      </div>
    </div>
  );
};

export default ChessGame;