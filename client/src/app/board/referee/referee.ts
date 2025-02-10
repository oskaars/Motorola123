import { PieceType, TeamType, Piece, Position } from '../components/Chessboard';

export default class Referee {
    
    tileIsOccupied(x: number, y: number, boardState: Piece[]) {
        const piece = boardState.find(piece => piece.x === x && piece.y === y);
        return !!piece;
    }

    tileIsOccupiedByOpponent(x: number, y: number, boardState: Piece[], team: TeamType): boolean {
        const piece = boardState.find(piece => piece.x === x && piece.y === y);
        return piece ? piece.team !== team : false;
    }

    isValidMove(px: number, py: number, x: number, y: number, type: PieceType, team: TeamType, boardState: Piece[], enPassantTarget: Position | null): boolean {
        const targetPiece = boardState.find(piece => piece.x === x && piece.y === y);
        if(targetPiece && targetPiece.team === team){
            return false;
        }
        
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

                // En passant
                if (enPassantTarget && x === enPassantTarget.x && y === enPassantTarget.y) {
                    const pawnToCapture = boardState.find(
                        p => p.x === x && 
                            p.y === py && 
                            p.type === PieceType.PAWN && 
                            p.team !== team
                    );
                    if (pawnToCapture) {
                        const index = boardState.indexOf(pawnToCapture);
                        if (index > -1) {
                            boardState.splice(index, 1);
                        }
                        return true;
                    }
                }
            }
        }

        if (type === PieceType.KNIGHT) {
            const xDistance = Math.abs(x - px);
            const yDistance = Math.abs(y - py);
            return (xDistance === 2 && yDistance === 1) || (xDistance === 1 && yDistance === 2);
        }

        if (type === PieceType.BISHOP) {
            const xDistance = Math.abs(x - px);
            const yDistance = Math.abs(y - py);
            if (xDistance === yDistance) {
                const xDirection = x > px ? 1 : -1;
                const yDirection = y > py ? 1 : -1;
                for (let i = 1; i < xDistance; i++) {
                    if (this.tileIsOccupied(px + i * xDirection, py + i * yDirection, boardState)) {
                        return false;
                    }
                }
                return true;
            }
        }

        if (type === PieceType.ROOK) {
            if (x === px || y === py) {
                const xDirection = x > px ? 1 : x < px ? -1 : 0;
                const yDirection = y > py ? 1 : y < py ? -1 : 0;
                const distance = Math.max(Math.abs(x - px), Math.abs(y - py));
                for (let i = 1; i < distance; i++) {
                    if (this.tileIsOccupied(px + i * xDirection, py + i * yDirection, boardState)) {
                        return false;
                    }
                }
                return true;
            }
        }

        if (type === PieceType.QUEEN) {
            const xDistance = Math.abs(x - px);
            const yDistance = Math.abs(y - py);
            
            if (x === px || y === py || xDistance === yDistance) {
                const xDirection = x > px ? 1 : x < px ? -1 : 0;
                const yDirection = y > py ? 1 : y < py ? -1 : 0;
                const distance = Math.max(xDistance, yDistance);
                for (let i = 1; i < distance; i++) {
                    if (this.tileIsOccupied(px + i * xDirection, py + i * yDirection, boardState)) {
                        return false;
                    }
                }
                return true;
            }
        }

        if (type === PieceType.KING) {
            const xDistance = Math.abs(x - px);
            const yDistance = Math.abs(y - py);
            return xDistance <= 1 && yDistance <= 1;
        }
        
        return false;
    }
}