import { validateFen } from '@/app/utils/chess';

describe('FEN Validation', () => {
  it('should validate a correct FEN string', () => {
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    expect(validateFen(fen).ok).toBe(true);
  });

  it('should reject an invalid FEN string', () => {
    const fen = "invalid";
    expect(validateFen(fen).ok).toBe(false);
  });

  it('should reject FEN with missing fields', () => {
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
    expect(validateFen(fen).ok).toBe(false);
  });
});
