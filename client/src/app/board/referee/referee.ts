import { PieceType, TeamType, Piece } from '../components/Chessboard';

export default class Referee {
    
    tileIsOccupied(x: number, y: number, boardState: Piece[]) {
        const piece = boardState.find(piece => piece.x === x && piece.y === y);
        return !!piece;
    }

    tileIsOccupiedByOpponent(x: number, y: number, boardState: Piece[], team: TeamType): boolean {
        const piece = boardState.find(piece => piece.x === x && piece.y === y);
        return piece ? piece.team !== team : false;
    }

    isValidMove(px: number, py: number, x: number, y: number, type: PieceType, team: TeamType, boardState: Piece[]): boolean {
        if (type === PieceType.PAWN) {
            const specialRow = (team === TeamType.OUR) ? 1 : 6;
            const pawnDirection = (team === TeamType.OUR) ? 1 : -1;

            if (px === x && y - py === pawnDirection) {
                if (!this.tileIsOccupied(x, y, boardState)) {
                    return true;
                }
            }
            if (px === x && py === specialRow && y - py === 2 * pawnDirection) {
                if (!this.tileIsOccupied(x, y, boardState) && !this.tileIsOccupied(x, y - pawnDirection, boardState)) {
                    return true;
                }
            }
            if (Math.abs(x - px) === 1 && y - py === pawnDirection) {
                if (this.tileIsOccupiedByOpponent(x, y, boardState, team)) {
                    return true;
                }
            }
        }
        
        return false;
    }
}