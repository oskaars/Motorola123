import { ChessGame } from '@/app/utils/chess';

describe('ChessGame - Move Generation', () => {
  it('should generate valid pawn moves from starting position', () => {
    const game = new ChessGame();
    const moves = game.getPossibleMoves('e2');
    expect(moves).toContain('e3');
    expect(moves).toContain('e4');
  });

  it('should generate valid knight moves from starting position', () => {
    const game = new ChessGame();
    const moves = game.getPossibleMoves('b1');
    expect(moves).toContain('a3');
    expect(moves).toContain('c3');
  });

  it('should not allow a pawn to move two squares if blocked', () => {
    const game = new ChessGame('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e3 0 1');
    game.board[2][4] = 'p'; // Block the e3 square
    const moves = game.getPossibleMoves('e2');
    expect(moves).not.toContain('e4');
  });
});
