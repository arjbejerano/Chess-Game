import React from 'react';
import { GameState, ComputerDifficulty } from '../types/chess';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { computerDifficulties } from '../utils/computerAI';

interface GameInfoProps {
  gameState: GameState;
  difficulty: ComputerDifficulty;
  onDifficultyChange: (difficulty: ComputerDifficulty) => void;
  onNewGame: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

const GameInfo: React.FC<GameInfoProps> = ({
  gameState,
  difficulty,
  onDifficultyChange,
  onNewGame,
  onUndo,
  canUndo
}) => {
  const getStatusMessage = (): string => {
    switch (gameState.gameStatus) {
      case 'check':
        return `${gameState.currentPlayer === 'white' ? 'White' : 'Black'} is in check!`;
      case 'checkmate':
        const winner = gameState.currentPlayer === 'white' ? 'Black' : 'White';
        return `Checkmate! ${winner} wins!`;
      case 'stalemate':
        return 'Stalemate! It\'s a draw.';
      case 'draw':
        return 'Draw!';
      default:
        if (gameState.isComputerThinking) {
          return 'Computer is thinking...';
        }
        return `${gameState.currentPlayer === 'white' ? 'White' : 'Black'} to move`;
    }
  };

  const getStatusColor = (): string => {
    switch (gameState.gameStatus) {
      case 'check':
        return 'destructive';
      case 'checkmate':
        return 'default';
      case 'stalemate':
      case 'draw':
        return 'secondary';
      default:
        return gameState.currentPlayer === 'white' ? 'default' : 'outline';
    }
  };

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Chess Battle
          <Badge variant={getStatusColor()}>
            {getStatusMessage()}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Difficulty</label>
          <Select
            value={difficulty.name}
            onValueChange={(value) => {
              const newDifficulty = computerDifficulties.find(d => d.name === value);
              if (newDifficulty) onDifficultyChange(newDifficulty);
            }}
            disabled={gameState.gameStatus !== 'playing' && gameState.gameStatus !== 'check'}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {computerDifficulties.map(diff => (
                <SelectItem key={diff.name} value={diff.name}>
                  {diff.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Game Statistics</div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Moves played: {gameState.moveHistory.length}</div>
            <div>Current turn: {gameState.currentPlayer === 'white' ? 'Your turn' : 'Computer\'s turn'}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={onNewGame} variant="outline" className="flex-1">
            New Game
          </Button>
          <Button 
            onClick={onUndo} 
            variant="outline" 
            disabled={!canUndo || gameState.isComputerThinking}
            className="flex-1"
          >
            Undo
          </Button>
        </div>

        {gameState.moveHistory.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Recent Moves</div>
            <div className="max-h-32 overflow-y-auto text-sm space-y-1">
              {gameState.moveHistory.slice(-6).map((move, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span>{gameState.moveHistory.length - 6 + index + 1}.</span>
                  <span>
                    {String.fromCharCode(97 + move.from.col)}{8 - move.from.row} → {' '}
                    {String.fromCharCode(97 + move.to.col)}{8 - move.to.row}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GameInfo;