import { validateFen } from '@/app/utils/chess';

describe('FEN Validation', () => {
    it('should validate a correct FEN string', () => {
        const validFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        expect(validateFen(validFen).ok).toBe(true);
    });

    it('should invalidate incorrect FEN strings', () => {
        const invalidFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0';
        expect(validateFen(invalidFen).ok).toBe(false);
    });

    it('should invalidate FEN with incorrect number of ranks', () => {
        const invalidFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP w KQkq - 0 1';
        expect(validateFen(invalidFen).ok).toBe(false);
        expect(validateFen(invalidFen).error).toBeDefined();
    });

    it('should invalidate FEN with invalid characters', () => {
        const invalidFen = 'rnbqkbnz/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        expect(validateFen(invalidFen).ok).toBe(false);
        expect(validateFen(invalidFen).error).toBeDefined();
    });

    it('should invalidate FEN with invalid side to move', () => {
        const invalidFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR x KQkq - 0 1';
        expect(validateFen(invalidFen).ok).toBe(false);
        expect(validateFen(invalidFen).error).toBeDefined();
    });
});
