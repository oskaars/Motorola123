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

    isKingInCheck(team: TeamType, boardState: Piece[]): boolean {
        // Find the king
        const king = boardState.find(p => p.type === PieceType.KING && p.team === team);
        if (!king) return false;

        // Check if any opponent piece can attack the king
        return boardState.some(piece => 
            piece.team !== team && 
            this.isValidMove(piece.x, piece.y, king.x, king.y, piece.type, piece.team, boardState, null)
        );
    }

    isCheckmate(team: TeamType, boardState: Piece[]): boolean {
        // If king is not in check, it's not checkmate
        if (!this.isKingInCheck(team, boardState)) return false;

        // Try all possible moves for all pieces
        return !boardState
            .filter(piece => piece.team === team)
            .some(piece => {
                // Try every square on the board
                for (let x = 0; x < 8; x++) {
                    for (let y = 0; y < 8; y++) {
                        // If we can make a valid move that gets us out of check
                        if (this.canMoveToSquare(piece, x, y, boardState)) {
                            return true;
                        }
                    }
                }
                return false;
            });
    }

    private canMoveToSquare(piece: Piece, x: number, y: number, boardState: Piece[]): boolean {
        // Check if the move is valid
        if (!this.isValidMove(piece.x, piece.y, x, y, piece.type, piece.team, boardState, null)) {
            return false;
        }

        // Simulate the move and check if it gets us out of check
        const simulatedBoard = [...boardState];
        const simulatedPiece = simulatedBoard.find(p => p.x === piece.x && p.y === piece.y);
        const capturedPiece = simulatedBoard.find(p => p.x === x && p.y === y);

        if (simulatedPiece) {
            const originalX = simulatedPiece.x;
            const originalY = simulatedPiece.y;

            // Make the move
            simulatedPiece.x = x;
            simulatedPiece.y = y;
            if (capturedPiece) {
                simulatedBoard.splice(simulatedBoard.indexOf(capturedPiece), 1);
            }

            // Check if we're still in check
            const stillInCheck = this.isKingInCheck(piece.team, simulatedBoard);

            // Restore the board state
            simulatedPiece.x = originalX;
            simulatedPiece.y = originalY;
            if (capturedPiece) {
                simulatedBoard.push(capturedPiece);
            }

            return !stillInCheck;
        }

        return false;
    }

    isValidMove(px: number, py: number, x: number, y: number, type: PieceType, team: TeamType, boardState: Piece[], enPassantTarget: Position | null): boolean {
        // First check if the move is valid according to piece rules
        const targetPiece = boardState.find(piece => piece.x === x && piece.y === y);
        if (targetPiece && targetPiece.team === team) {
            return false;
        }

        // Simulate the move to check if it would put/leave our king in check
        const simulatedBoard = [...boardState];
        const movingPiece = simulatedBoard.find(p => p.x === px && p.y === py);
        const capturedPiece = simulatedBoard.find(p => p.x === x && p.y === y);

        if (movingPiece) {
            const originalX = movingPiece.x;
            const originalY = movingPiece.y;

            // Make the move
            movingPiece.x = x;
            movingPiece.y = y;
            if (capturedPiece) {
                simulatedBoard.splice(simulatedBoard.indexOf(capturedPiece), 1);
            }

            // Check if the move would put/leave us in check
            const wouldBeInCheck = this.isKingInCheck(team, simulatedBoard);

            // Restore the board state
            movingPiece.x = originalX;
            movingPiece.y = originalY;
            if (capturedPiece) {
                simulatedBoard.push(capturedPiece);
            }

            if (wouldBeInCheck) {
                return false;
            }
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