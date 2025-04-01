import { WHITE, BLACK, PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING, PieceSymbol, Color } from '@/app/utils/chess';

describe('Chess Constants', () => {
  it('should have correct color constants', () => {
    expect(WHITE).toBe('w');
    expect(BLACK).toBe('b');
  });

  it('should have correct piece constants', () => {
    expect(PAWN).toBe('p');
    expect(KNIGHT).toBe('n');
    expect(BISHOP).toBe('b');
    expect(ROOK).toBe('r');
    expect(QUEEN).toBe('q');
    expect(KING).toBe('k');
  });

  it('should have correct piece symbol type', () => {
    const pieceSymbols: PieceSymbol[] = ['p', 'n', 'b', 'r', 'q', 'k', 'P', 'N', 'B', 'R', 'Q', 'K'];
    expect(pieceSymbols.every(symbol => typeof symbol === 'string')).toBe(true);
  });

  it('should have correct color type', () => {
    const colors: Color[] = ['w', 'b'];
    expect(colors.every(color => typeof color === 'string')).toBe(true);
  });
});
